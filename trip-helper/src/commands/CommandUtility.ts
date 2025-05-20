import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { TripHelperApp } from "../../TripHelperApp";
import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ICommandUtility,
    ICommandUtilityParams,
} from "../definition/command/ICommandUtility";
import { CommandHandler } from "../handlers/CommandHandler";

export class CommandUtility implements ICommandUtility {
    public app: TripHelperApp;
    public params: Array<string>;
    public sender: IUser;
    public room: IRoom;
    public read: IRead;
    public modify: IModify;
    public http: IHttp;
    public persis: IPersistence;
    public triggerId?: string;
    public threadId?: string;

    constructor(props: ICommandUtilityParams) {
        this.app = props.app;
        this.params = props.params;
        this.sender = props.sender;
        this.room = props.room;
        this.read = props.read;
        this.modify = props.modify;
        this.http = props.http;
        this.persis = props.persis;
        this.triggerId = props.triggerId;
        this.threadId = props.threadId;
    }

    public async resolveCommand(): Promise<void> {
        const handler = new CommandHandler({
            app: this.app,
            sender: this.sender,
            room: this.room,
            read: this.read,
            modify: this.modify,
            http: this.http,
            persis: this.persis,
            triggerId: this.triggerId,
            threadId: this.threadId,
        });
        const command = this.params[0].toLowerCase();
        switch (command) {
            case "help":
                await handler.Help();
            case "config":
        }
    }
}
