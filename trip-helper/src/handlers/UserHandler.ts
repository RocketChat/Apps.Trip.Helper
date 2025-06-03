import { IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { TripHelperApp } from "../../TripHelperApp";
import {
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

    constructor(
        app: TripHelperApp,
        read: IRead,
        modify: IModify,
        room: IRoom,
        sender: IUser
    ) {
        this.app = app;
        this.read = read;
        this.modify = modify;
        this.room = room;
        this.sender = sender;
    }
    public async confirmLocation(message: string): Promise<void> {
        sendConfirmationMessage(
            this.app,
            this.read,
            this.modify,
            this.room,
            this.sender,
            `Ohh! You are enjoying your trip at ${message}. Do you want to use this location?`,
        );
    }

    public async confirmLocationAccepted(): Promise<void> {
        notifyMessage(
            this.room,
            this.read,
            this.sender,
            "Nice, know we have your location, Just ask us anything about your trip!"
        );
    }

    public async noLocationDetected(): Promise<void> {
        sendGetLocationMessage(
            this.app,
            this.read,
            this.modify,
            this.room,
            this.sender,
            "We can't detect your location automatically. Please share your location with us to continue."
        );
    }

    public async noLocationDetectedAndNotProvided(): Promise<void> {
        notifyMessage(
            this.room,
            this.read,
            this.sender,
            "You know we can't help you without your location, right? Please provide your location to continue."
        );
    }
}
