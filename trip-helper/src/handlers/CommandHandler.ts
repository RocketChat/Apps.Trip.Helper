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
import {
    sendDefaultNotification,
    sendHelperMessage,
    sendSetReminder_1,
    sendSetReminder_2,
    sendSetReminder_3,
} from "../helpers/Notifications";
import { OnInstallContent } from "../enum/messages";
import { BlockBuilder } from "../lib/BlockBuilder";
import { CreatePrivateGroup } from "../helpers/CreatePrivateGroups";
import { UserReminderModal } from "../modal/ReminderModal";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";
import { notifyMessage, sendMessage } from "../helpers/Message";
import { getAPIConfig } from "../config/settings";
import { InfoHandler } from "./AIHandlers/InfoHandler";
import { LOCATION_INFORMATION } from "../enum/mainAppResponses";
import { EventReminderHandler } from "./AIHandlers/EventReminderHandler";
import { storeLocationEvents } from "../storage/EventStorage";
import { LocationEvents } from "../definition/handlers/EventHandler";

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

    public async getDefaultNotification(): Promise<void> {
        return sendDefaultNotification(
            this.app,
            this.read,
            this.modify,
            this.sender,
            this.room
        );
    }

    public async Info(): Promise<void> {
        const appUser = (await this.read.getUserReader().getAppUser()) as IUser;

        const assoc = new RocketChatAssociationRecord(
            RocketChatAssociationModel.ROOM,
            `${this.room.id}/${this.room.slugifiedName}`
        );
        const userLocation = (
            await this.read.getPersistenceReader().readByAssociation(assoc)
        )[0] as { userLocation?: string } | undefined;
        const locationValue = userLocation?.userLocation;

        const { searchEngineID, searchEngineApiKey } = await getAPIConfig(
            this.read
        );

        if (!searchEngineApiKey || !searchEngineID) {
            notifyMessage(
                this.room,
                this.read,
                this.sender,
                "Google Custom Search API key or searchEngineID is missing."
            );
            return;
        }

        if (!locationValue) {
            notifyMessage(
                this.room,
                this.read,
                this.sender,
                "Please set your location first using the `/trip location` command. Then we'll fetch local information for you."
            );
            return;
        }

        const infoHandler = new InfoHandler(this.http, this.read);
        const eventHandler = new EventReminderHandler(this.http, this.read);

        const currentMonthYear = new Date().toLocaleString("default", {
            month: "long",
            year: "numeric",
        });

        const categories = LOCATION_INFORMATION.EVENTS_CATEGORIES;

        let allResults: any[] = [];
        const seenUrls = new Set();

        notifyMessage(
            this.room,
            this.read,
            this.sender,
            `Fetching local information for ${locationValue}...`
        );

        for (const category of categories) {
            const query = `(${category}) events in ${locationValue} ${currentMonthYear}`;
            const url = `https://www.googleapis.com/customsearch/v1?key=${searchEngineApiKey}&cx=${searchEngineID}&q=${encodeURIComponent(
                query
            )}`;

            try {
                const response = await this.http.get(url);
                const data = response.data;

                if (data.items) {
                    for (const item of data.items) {
                        if (allResults.length >= 7) break;
                        if (!seenUrls.has(item.link)) {
                            const result = {
                                title: item.title,
                                snippet: item.snippet,
                                link: item.link,
                                source: item.displayLink,
                            };
                            allResults.push(result);
                            seenUrls.add(item.link);
                        }
                    }
                }
            } catch (error) {
                notifyMessage(
                    this.room,
                    this.read,
                    this.sender,
                    `Error fetching data for category "${category}": ${error.message}`
                );
            }
        }

        if (allResults.length > 0) {
            notifyMessage(
                this.room,
                this.read,
                this.sender,
                `Processing ${allResults.length} local events found in ${locationValue}...`
            );
            const infoResponses = await infoHandler.sendInfo(
                allResults,
                locationValue
            );
            if (!infoResponses) {
                notifyMessage(
                    this.room,
                    this.read,
                    this.sender,
                    "No relevant events found in your area."
                );
                return;
            }
            await sendMessage(
                this.modify,
                appUser,
                this.room,
                `${infoResponses}`
            );
            const currentDate = new Date().toLocaleDateString("en-GB");

            const er: string = await eventHandler.sendEventDetails(
                infoResponses,
                currentDate
            );

            const eventResponse: LocationEvents = JSON.parse(er);

            const success = await storeLocationEvents(
                this.read,
                this.sender,
                this.room,
                this.persis,
                eventResponse
            );

            if (!success) {
                notifyMessage(
                    this.room,
                    this.read,
                    this.sender,
                    "Failed to store event details. Please try again later."
                );
                return;
            }

            if (eventResponse[0]) {
                await sendSetReminder_1(
                    this.app,
                    this.read,
                    this.modify,
                    this.room,
                    this.sender,
                    `Here are some events happening in ${locationValue}. You can set a reminder for any of these events by clicking the button below. \n\n Would you like to set a reminder for: "${eventResponse[0].title}"?`
                );
            }
            if (eventResponse[1]) {
                sendSetReminder_2(
                    this.app,
                    this.read,
                    this.modify,
                    this.room,
                    this.sender,
                    `Would you like to set a reminder for: "${eventResponse[1].title}"?`
                );
            }
            if (eventResponse[2]) {
                sendSetReminder_3(
                    this.app,
                    this.read,
                    this.modify,
                    this.room,
                    this.sender,
                    `Would you like to set a reminder for: "${eventResponse[2].title}"?`
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
    }
    public async emergency(): Promise<void> {
        const appUser = (await this.read.getUserReader().getAppUser()) as IUser;
        const locationAssoc = new RocketChatAssociationRecord(
            RocketChatAssociationModel.ROOM,
            `${this.room.id}/${this.room.slugifiedName}`
        );
        const userLocation = (
            await this.read
                .getPersistenceReader()
                .readByAssociation(locationAssoc)
        )[0] as { userLocation?: string } | undefined;
        const locationValue = userLocation?.userLocation;

        if (!locationValue) {
            notifyMessage(
                this.room,
                this.read,
                this.sender,
                "Please set your location first using the `/trip location` command. Then I can fetch emergency alerts for you."
            );
            return;
        }

        const { searchEngineApiKey } = await getAPIConfig(this.read);

        if (!searchEngineApiKey) {
            notifyMessage(
                this.room,
                this.read,
                this.sender,
                "Google API key is missing. Please configure the API key to fetch emergency alerts."
            );
            return;
        }

        notifyMessage(
            this.room,
            this.read,
            this.sender,
            `Checking for emergency alerts in ${locationValue}...`
        );

        const apiUrl = `https://api.weather.gov/alerts/active?area=${encodeURIComponent(
            locationValue
        )}`;

        try {
            const response = await this.http.get(apiUrl);
            const data = response.data;

            if (!data || !data.features || data.features.length === 0) {
                notifyMessage(
                    this.room,
                    this.read,
                    this.sender,
                    "No current emergency alerts for your area."
                );
                return;
            }

            let alertMessages = "";
            for (const alert of data.features.slice(0, 3)) {
                const properties = alert.properties;
                const title = properties.headline || "Emergency Alert";
                const description = properties.description || "";

                alertMessages += `Warning: ${title}\n${description}\n\n`;
            }

            await sendMessage(
                this.modify,
                appUser,
                this.room,
                `Emergency Alerts for ${locationValue}:\n\n${alertMessages}`
            );
        } catch (error) {
            notifyMessage(
                this.room,
                this.read,
                this.sender,
                `Error fetching emergency alerts: ${error.message}`
            );
        }
    }
}
