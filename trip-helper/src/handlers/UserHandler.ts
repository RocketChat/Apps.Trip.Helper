import { IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { TripHelperApp } from "../../TripHelperApp";
import { sendConfirmationMessage } from "../helpers/Notifications";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";

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
            `${message} is your current location. Do you want to use this location?`
        );
    }
}
