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
import { RoomInteractionStorage } from "../storage/RoomInteraction";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";
import { notifyMessage } from "../helpers/Message";

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
        const roomInteractionStorage = new RoomInteractionStorage(
            this.persis,
            this.read.getPersistenceReader(),
            this.sender.id
        );
        roomInteractionStorage.storeInteractionRoomId(this.room.id);

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
        const subCommand = this.params[1]
            ? this.params[1].toLowerCase()
            : undefined;
        switch (command) {
            case "help":
                await handler.Help();
                break;
            case "create":
                if (subCommand) {
                    const createRoom = await this.storeRoomName(subCommand);
                    if (createRoom) {
                        await handler.Create(subCommand);
                    }
                } else {
                    notifyMessage(
                        this.room,
                        this.read,
                        this.sender,
                        "Please provide a name for the trip channel. Usage: `/trip create <channel-name>`"
                    );
                }
        }
    }

    public async storeRoomName(roomName: string): Promise<boolean> {
        const assoc = new RocketChatAssociationRecord(
            RocketChatAssociationModel.USER,
            this.sender.id
        );

        const existingData = (await this.read
            .getPersistenceReader()
            .readByAssociation(assoc)) as Array<{ tripRooms: string[] }>;
        const roomList = existingData?.[0]?.tripRooms || [];
        if (!roomList.includes(roomName)) {
            roomList.push(roomName);
        } else {
            notifyMessage(
                this.room,
                this.read,
                this.sender,
                `Room name ${roomName} already exists.`
            );
            return false;
        }

        await this.persis.updateByAssociation(
            assoc,
            {
                tripRooms: roomList,
            },
            true
        );
        notifyMessage(
            this.room,
            this.read,
            this.sender,
            `Room name stored as ${roomName} for user ${this.sender.username}`
        );
        return true;
    }
}
