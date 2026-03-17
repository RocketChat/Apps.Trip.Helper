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
import { Language, t } from "../translation/translation";
import { getResponseLanguage } from "../helpers/Language";

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
    private readonly language: Promise<Language>;

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
        this.language = getResponseLanguage(this.read, this.sender);
    }
    public async Help(): Promise<void> {
        sendHelperMessage(this.read, this.modify, this.room, this.sender);
    }

    public async Create(subCommand: string): Promise<void> {
        const language = await this.language;
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
        const title = [t("Install_Preview_Title", language)];
        const description = [t("Install_Preview_Description", language)];
        const contextElements = [t("Install_Preview_Context", language)];
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
        const text = t("Welcome_User", language, {
            username: this.sender.username,
            welcomeMessage: t("Install_Welcome_Message", language),
        });

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
        const language = await this.language;
        const modal = await UserReminderModal({
            app: this.app,
            modify: this.modify,
            read: this.read,
            http: this.http,
            persis: this.persis,
            room: this.room,
            language,
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
        const language = await this.language;
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
                t("Google_Search_Config_Missing", language)
            );
            return;
        }

        if (!locationValue) {
            notifyMessage(
                this.room,
                this.read,
                this.sender,
                t("Location_Not_Set_Info", language)
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
            t("Fetching_Local_Info", language, {
                location: locationValue,
            })
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
                const errorMessage =
                    error instanceof Error ? error.message : String(error);
                notifyMessage(
                    this.room,
                    this.read,
                    this.sender,
                    t("Error_Fetching_Category", language, {
                        category,
                        error: errorMessage,
                    })
                );
            }
        }

        if (allResults.length > 0) {
            notifyMessage(
                this.room,
                this.read,
                this.sender,
                t("Processing_Local_Events", language, {
                    count: allResults.length,
                    location: locationValue,
                })
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
                    t("No_Relevant_Events", language)
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
                    t("Failed_To_Store_Event_Details", language)
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
                    t("Set_Reminder_Primary", language, {
                        location: locationValue,
                        event: eventResponse[0].title,
                    })
                );
            }
            if (eventResponse[1]) {
                sendSetReminder_2(
                    this.app,
                    this.read,
                    this.modify,
                    this.room,
                    this.sender,
                    t("Set_Reminder_Generic", language, {
                        event: eventResponse[1].title,
                    })
                );
            }
            if (eventResponse[2]) {
                sendSetReminder_3(
                    this.app,
                    this.read,
                    this.modify,
                    this.room,
                    this.sender,
                    t("Set_Reminder_Generic", language, {
                        event: eventResponse[2].title,
                    })
                );
            }
        } else {
            notifyMessage(
                this.room,
                this.read,
                this.sender,
                t("No_Local_Info", language)
            );
        }
    }
    public async emergency(): Promise<void> {
        const language = await this.language;
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
                t("Location_Not_Set_Emergency", language)
            );
            return;
        }

        const { searchEngineApiKey } = await getAPIConfig(this.read);

        if (!searchEngineApiKey) {
            notifyMessage(
                this.room,
                this.read,
                this.sender,
                t("Google_Api_Key_Missing", language)
            );
            return;
        }

        notifyMessage(
            this.room,
            this.read,
            this.sender,
            t("Checking_Emergency_Alerts", language, {
                location: locationValue,
            })
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
                    t("No_Emergency_Alerts", language)
                );
                return;
            }

            let alertMessages = "";
            for (const alert of data.features.slice(0, 3)) {
                const properties = alert.properties;
                const title =
                    properties.headline ||
                    t("Emergency_Default_Title", language);
                const description = properties.description || "";

                alertMessages += t("Emergency_Warning_Line", language, {
                    title,
                    description,
                });
            }

            await sendMessage(
                this.modify,
                appUser,
                this.room,
                t("Emergency_Alerts_Header", language, {
                    location: locationValue,
                    alerts: alertMessages,
                })
            );
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            notifyMessage(
                this.room,
                this.read,
                this.sender,
                t("Error_Fetching_Emergency", language, {
                    error: errorMessage,
                })
            );
        }
    }
}
