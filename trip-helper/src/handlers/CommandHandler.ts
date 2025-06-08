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
}
