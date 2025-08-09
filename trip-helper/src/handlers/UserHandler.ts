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
import {
    LocationEvent,
    LocationEvents,
} from "../definition/handlers/EventHandler";

export class UserHandler {
    public app: TripHelperApp;
    public read: IRead;
    public modify: IModify;
    public room: IRoom;
    public sender: IUser;
    public http: IHttp;
    public persis: IPersistence;
    public triggerId?: string;
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
    }

    public async confirmLocation(message: string): Promise<void> {
        UserLocationStateHandler.setUserLocation(message);
        sendConfirmationMessage(
            this.app,
            this.read,
            this.modify,
            this.room,
            this.sender,
            `Ohh! You are enjoying your **trip at ${message}**. Do you want to use this **location**?`
        );
    }

    public async changeLocation(message: string): Promise<void> {
        UserLocationStateHandler.setUserLocation(message);
        await this.confirmLocationAccepted();
    }

    public async confirmLocationAccepted(): Promise<void> {
        const userLocation = UserLocationStateHandler.getUserLocation();
        if (!userLocation) {
            notifyMessage(
                this.room,
                this.read,
                this.sender,
                "No location found to confirm."
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
                "Unable to store your location due to a system error. Please try again later."
            );
            return;
        }
        notifyMessage(
            this.room,
            this.read,
            this.sender,
            `Your location has been stored as: ${userLocation}. You can now ask for trip-related information!`
        );
    }

    public async noLocationDetected(): Promise<void> {
        sendGetLocationMessage(
            this.app,
            this.read,
            this.modify,
            this.room,
            this.sender,
            "We **can't detect** your location automatically. Please **share your location** with us to continue. We will use your device **IP address** to get your location."
        );
    }

    public async noLocationDetectedAndNotProvided(): Promise<void> {
        notifyMessage(
            this.room,
            this.read,
            this.sender,
            "You know we can't help you without your location, right? Please provide your **Location to continue**."
        );
    }

    private cachedLocationIP: any = null;

    public async locationDetectedThroughIP(): Promise<void> {
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
                `Your Location coordinates: ${response.latitude}, ${response.longitude}`
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
                    "No location found to confirm."
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
                    "Unable to store your location due to a system error. Please try again later."
                );
                return;
            }

            notifyMessage(
                this.room,
                this.read,
                this.sender,
                `Your location has been stored as: ${userLocation}. You can now ask for trip-related information!`
            );
        }
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

    public async setReminder_1(): Promise<void> {
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
            room: this.room,
            eventResponse: sendData,
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
            room: this.room,
            eventResponse: sendData,
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
            room: this.room,
            eventResponse: sendData,
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
