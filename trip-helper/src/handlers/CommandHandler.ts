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
}
