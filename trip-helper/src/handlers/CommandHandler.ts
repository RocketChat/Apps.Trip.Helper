import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { TripHelperApp } from "../../TripHelperApp";
import { IHanderParams, IHandler } from "../definition/handlers/IHandler";
import { sendHelperMessage } from "../helpers/Notifications";
import { OnInstallContent } from "../enum/messages";
import { BlockBuilder } from "../lib/BlockBuilder";
import { CreatePrivateGroup } from "../helpers/CreatePrivateGroups";
import { UserReminderModal } from "../modal/ReminderModal";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";
import { notifyMessage } from "../helpers/Message";
import { getAPIConfig } from "../config/settings";

export class CommandHandler implements IHandler {
    public app: TripHelperApp;
    public sender: IUser;
    public room: IRoom;
    public read: IRead;
    public modify: IModify;
    public http: IHttp;
    public persis: IPersistence;
    public triggerId?: string;
    public threadId?: string;

    constructor(params: IHanderParams) {
        this.app = params.app;
        this.sender = params.sender;
        this.room = params.room;
        this.read = params.read;
        this.modify = params.modify;
        this.http = params.http;
        this.persis = params.persis;
        this.triggerId = params.triggerId;
        this.threadId = params.threadId;
    }
    public async Help(): Promise<void> {
        sendHelperMessage(this.read, this.modify, this.room, this.sender);
    }

    public async Create(subCommand: string): Promise<void> {
        const appUser = (await this.read.getUserReader().getAppUser()) as IUser;
        const members = [this.sender.username, appUser.username];
        const room = await CreatePrivateGroup(
            this.read,
            this.modify,
            members,
            subCommand
        );
        const appId = this.app.getID();
        const blockBuilder = new BlockBuilder(appId);
        const title = [OnInstallContent.PREVIEW_TITLE.toString()];
        const description = [OnInstallContent.PREVIEW_DESCRIPTION.toString()];
        const contextElements = [OnInstallContent.PREVIEW_CONTEXT.toString()];
        const footer = blockBuilder.createContextBlock({
            contextElements: contextElements,
        });
        const thumb = {
            url: OnInstallContent.PREVIEW_IMAGE.toString(),
        };

        const installationPreview = blockBuilder.createPreviewBlock({
            title,
            description,
            footer,
            thumb,
        });
        const text = `Hey **${
            this.sender.username
        }** 👋, I am your Trip Helper! \n ${OnInstallContent.Welcome_Message.toString()}`;

        const previewBuilder = this.modify
            .getCreator()
            .startMessage()
            .setRoom(room)
            .setSender(appUser)
            .setGroupable(false)
            .setBlocks([installationPreview])
            .setParseUrls(true);

        const textMessageBuilder = this.modify
            .getCreator()
            .startMessage()
            .setRoom(room)
            .setSender(appUser)
            .setGroupable(true)
            .setParseUrls(false)
            .setText(text);

        await this.modify.getCreator().finish(previewBuilder);
        await this.modify.getCreator().finish(textMessageBuilder);
    }

    public async reminder(): Promise<void> {
        const modal = await UserReminderModal({
            app: this.app,
            modify: this.modify,
            room: this.room,
        });
        if (modal instanceof Error) {
            this.app.getLogger().error(modal.message);
            return;
        }

        const triggerId = this.triggerId;
        if (triggerId) {
            await this.modify
                .getUiController()
                .openSurfaceView(modal, { triggerId }, this.sender);
        }
        return;
}
    public async Info(): Promise<void> {
        const assoc = new RocketChatAssociationRecord(
            RocketChatAssociationModel.ROOM,
            `${this.room.id}/${this.room.slugifiedName}`
        );
        const userLocation = (
            await this.read.getPersistenceReader().readByAssociation(assoc)
        )[0] as { userLocation?: string } | undefined;
        const locationValue = userLocation?.userLocation;

        if (!locationValue) {
            notifyMessage(
                this.room,
                this.read,
                this.sender,
                "Please provide a valid location first."
            );
            return;
        }
        // https://www.googleapis.com/customsearch/v1?[parameters]

        const { searchEngineID, searchEngineApiKey } = await getAPIConfig(
            this.read
        );

        const userQuery = `local information about ${locationValue} such as ongoing events, local news, and other relevant information`;
        const query = encodeURIComponent(userQuery);

        if (!searchEngineApiKey || !searchEngineID) {
            notifyMessage(
                this.room,
                this.read,
                this.sender,
                "Google Custom Search API key or searchEngineID is missing."
            );
            return;
        }

        const url = `https://www.googleapis.com/customsearch/v1?key=${searchEngineApiKey}&cx=${searchEngineID}&q=${query}`;

        let responses = "";
        try {
            const response = await this.http.get(url);
            if (
                response.data &&
                response.data.items &&
                response.data.items.length > 0
            ) {
                const items = response.data.items.slice(0, 5);
                for (const item of items) {
                    const topResult = item;
                    const title = topResult.title || "No Title";
                    const snippet = topResult.snippet || "No Description";
                    const link = topResult.link || "";

                    responses += `- ${title} \n${snippet}\n${link}\n\n`;
                }
                if (responses.length > 0) {
                    notifyMessage(
                        this.room,
                        this.read,
                        this.sender,
                        `### Here are some local information results for ${locationValue}:\n\n${responses}`
                    );
                }
            } else {
                notifyMessage(
                    this.room,
                    this.read,
                    this.sender,
                    "No local information found for this location."
                );
            }
        } catch (error) {
            notifyMessage(
                this.room,
                this.read,
                this.sender,
                "Error fetching local information."
            );
        }
    }
}
