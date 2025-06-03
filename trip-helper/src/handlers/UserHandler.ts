import {
    IHttp,
    IModify,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { TripHelperApp } from "../../TripHelperApp";
import {
    getUserAddress,
    getUserLocationIP,
    sendConfirmationMessage,
    sendGetLocationMessage,
} from "../helpers/Notifications";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { notifyMessage } from "../helpers/Message";

export class UserHandler {
    public app: TripHelperApp;
    public read: IRead;
    public modify: IModify;
    public room: IRoom;
    public sender: IUser;
    public http: IHttp;

    constructor(
        app: TripHelperApp,
        read: IRead,
        modify: IModify,
        room: IRoom,
        sender: IUser,
        http: IHttp
    ) {
        this.app = app;
        this.read = read;
        this.modify = modify;
        this.room = room;
        this.sender = sender;
        this.http = http;
    }
    public async confirmLocation(message: string): Promise<void> {
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
        notifyMessage(
            this.room,
            this.read,
            this.sender,
            "Nice, now we have your **Location**, Just ask us anything about your **Trip**!"
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
            const addResponse = getUserAddress(
                response,
                this.http,
                this.read,
                this.room,
                this.sender
            );
            // store the address in context of the user and room.
        }
    }
}
