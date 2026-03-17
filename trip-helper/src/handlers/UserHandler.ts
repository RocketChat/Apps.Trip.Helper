import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { TripHelperApp } from "../../TripHelperApp";
import {
    sendConfirmationMessage,
    sendGetLocationMessage,
} from "../helpers/Notifications";
import {
    getUserLocationIP,
    getUserAddressThroughIP,
} from "../api/GetLocationInfo";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { notifyMessage } from "../helpers/Message";
import { storeUserLocation } from "../storage/UserLocationStorage";
import { UserLocationStateHandler } from "./UserLocationStateHandler";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";
import { UserReminderModal } from "../modal/ReminderModal";
import { LocationEvent } from "../definition/handlers/EventHandler";
import { Language, t } from "../translation/translation";
import { getResponseLanguage } from "../helpers/Language";

export class UserHandler {
    public app: TripHelperApp;
    public read: IRead;
    public modify: IModify;
    public room: IRoom;
    public sender: IUser;
    public http: IHttp;
    public persis: IPersistence;
    public triggerId?: string;
    private readonly language: Promise<Language>;
    constructor(
        app: TripHelperApp,
        read: IRead,
        modify: IModify,
        room: IRoom,
        sender: IUser,
        http: IHttp,
        persis: IPersistence,
        triggerId?: string
    ) {
        this.app = app;
        this.read = read;
        this.modify = modify;
        this.room = room;
        this.sender = sender;
        this.http = http;
        this.persis = persis;
        this.triggerId = triggerId;
        this.language = getResponseLanguage(this.read, sender);
    }

    public async confirmLocation(message: string): Promise<void> {
        const language = await this.language;
        UserLocationStateHandler.setUserLocation(message);
        sendConfirmationMessage(
            this.app,
            this.read,
            this.modify,
            this.room,
            this.sender,
            t("Enjoying_Trip_At_Location", language, {
                location: message,
            })
        );
    }

    public async changeLocation(message: string): Promise<void> {
        UserLocationStateHandler.setUserLocation(message);
        await this.confirmLocationAccepted();
    }

    public async confirmLocationAccepted(): Promise<void> {
        const language = await this.language;
        const userLocation = UserLocationStateHandler.getUserLocation();
        if (!userLocation) {
            notifyMessage(
                this.room,
                this.read,
                this.sender,
                t("No_Location_Found_To_Confirm", language)
            );
            return;
        }

        const success = await storeUserLocation(
            this.read,
            this.sender,
            this.room,
            this.persis,
            userLocation
        );
        if (!success) {
            notifyMessage(
                this.room,
                this.read,
                this.sender,
                t("Unable_To_Store_Location_System_Error", language)
            );
            return;
        }
        notifyMessage(
            this.room,
            this.read,
            this.sender,
            t("Location_Stored_Successfully", language, {
                location: userLocation,
            })
        );
    }

    public async noLocationDetected(): Promise<void> {
        const language = await this.language;
        sendGetLocationMessage(
            this.app,
            this.read,
            this.modify,
            this.room,
            this.sender,
            t("Cannot_Detect_Location", language)
        );
    }

    public async noLocationDetectedAndNotProvided(): Promise<void> {
        const language = await this.language;
        notifyMessage(
            this.room,
            this.read,
            this.sender,
            t("Location_Required_To_Continue", language)
        );
    }

    private cachedLocationIP: any = null;

    public async locationDetectedThroughIP(): Promise<void> {
        const language = await this.language;
        if (!this.cachedLocationIP) {
            this.cachedLocationIP = await getUserLocationIP(
                this.http,
                this.read,
                this.room,
                this.sender
            );
        }
        const response = this.cachedLocationIP;
        if (response) {
            notifyMessage(
                this.room,
                this.read,
                this.sender,
                t("Location_Coordinates", language, {
                    latitude: response.latitude,
                    longitude: response.longitude,
                })
            );
            const userLocation = await getUserAddressThroughIP(
                response,
                this.http,
                this.read,
                this.room,
                this.sender
            );
            if (!userLocation) {
                notifyMessage(
                    this.room,
                    this.read,
                    this.sender,
                    t("No_Location_Found_To_Confirm", language)
                );
                return;
            }

            const success = await storeUserLocation(
                this.read,
                this.sender,
                this.room,
                this.persis,
                userLocation
            );
            if (!success) {
                notifyMessage(
                    this.room,
                    this.read,
                    this.sender,
                    t("Unable_To_Store_Location_System_Error", language)
                );
                return;
            }

            notifyMessage(
                this.room,
                this.read,
                this.sender,
                t("Location_Stored_Successfully", language, {
                    location: userLocation,
                })
            );
        }
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

    public async setReminder_1(): Promise<void> {
        const language = await this.language;
        const assoc = new RocketChatAssociationRecord(
            RocketChatAssociationModel.ROOM,
            `${this.room.id}/events`
        );
        const data = (await this.read
            .getPersistenceReader()
            .readByAssociation(assoc)) as Array<{
            eventResponse: LocationEvent[];
        }>;

        const eventResponse = data?.[0]?.eventResponse || [];
        const sendData = eventResponse[0];

        const modal = await UserReminderModal({
            app: this.app,
            modify: this.modify,
            read: this.read,
            http: this.http,
            persis: this.persis,
            room: this.room,
            eventResponse: sendData,
            language,
        });
        if (modal instanceof Error) {
            this.app.getLogger().error(modal.message);
            return;
        }

        if (this.triggerId) {
            await this.modify
                .getUiController()
                .openSurfaceView(
                    modal,
                    { triggerId: this.triggerId },
                    this.sender
                );
        }
    }
    public async setReminder_2(): Promise<void> {
        const language = await this.language;
        const assoc = new RocketChatAssociationRecord(
            RocketChatAssociationModel.ROOM,
            `${this.room.id}/events`
        );
        const data = (await this.read
            .getPersistenceReader()
            .readByAssociation(assoc)) as Array<{
            eventResponse: LocationEvent[];
        }>;

        const eventResponse = data?.[0]?.eventResponse || [];
        const sendData = eventResponse[1];

        const modal = await UserReminderModal({
            app: this.app,
            modify: this.modify,
            read: this.read,
            http: this.http,
            persis: this.persis,
            room: this.room,
            eventResponse: sendData,
            language,
        });
        if (modal instanceof Error) {
            this.app.getLogger().error(modal.message);
            return;
        }

        if (this.triggerId) {
            await this.modify
                .getUiController()
                .openSurfaceView(
                    modal,
                    { triggerId: this.triggerId },
                    this.sender
                );
        }
    }
    public async setReminder_3(): Promise<void> {
        const language = await this.language;
        const assoc = new RocketChatAssociationRecord(
            RocketChatAssociationModel.ROOM,
            `${this.room.id}/events`
        );
        const data = (await this.read
            .getPersistenceReader()
            .readByAssociation(assoc)) as Array<{
            eventResponse: LocationEvent[];
        }>;

        const eventResponse = data?.[0]?.eventResponse || [];
        const sendData = eventResponse[2];
        const modal = await UserReminderModal({
            app: this.app,
            modify: this.modify,
            read: this.read,
            http: this.http,
            persis: this.persis,
            room: this.room,
            eventResponse: sendData,
            language,
        });
        if (modal instanceof Error) {
            this.app.getLogger().error(modal.message);
            return;
        }

        if (this.triggerId) {
            await this.modify
                .getUiController()
                .openSurfaceView(
                    modal,
                    { triggerId: this.triggerId },
                    this.sender
                );
        }
    }
}
