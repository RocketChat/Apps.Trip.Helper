import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { TripHelperApp } from "../../TripHelperApp";
import {
    getUserAddressThroughIP,
    getUserLocationIP,
    sendConfirmationMessage,
    sendGetLocationMessage,
} from "../helpers/Notifications";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { notifyMessage } from "../helpers/Message";
import { storeUserLocation } from "../storage/UserLocationStorage";
import { UserLocationStateHandler } from "./UserLocationStateHandler";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";

export class UserHandler {
    public app: TripHelperApp;
    public read: IRead;
    public modify: IModify;
    public room: IRoom;
    public sender: IUser;
    public http: IHttp;
    public persis: IPersistence;

    constructor(
        app: TripHelperApp,
        read: IRead,
        modify: IModify,
        room: IRoom,
        sender: IUser,
        http: IHttp,
        persis: IPersistence
    ) {
        this.app = app;
        this.read = read;
        this.modify = modify;
        this.room = room;
        this.sender = sender;
        this.http = http;
        this.persis = persis;
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
        }
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
            "You know we can't help you without your location, right? Please provide your **location to continue**."
        );
    }

    public async locationDetectedThroughIP(): Promise<void> {
        const response = await getUserLocationIP(
            this.http,
            this.read,
            this.room,
            this.sender
        );
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
            }
        }
    }
}
