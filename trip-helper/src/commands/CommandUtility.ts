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

import { notifyMessage } from "../helpers/Message";
import { storeRoomName } from "../storage/RoomNameStorage";
import { sendGetLocationMessage } from "../helpers/Notifications";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";
import { t } from "../translation/translation";
import { getResponseLanguage } from "../helpers/Language";

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
        const language = await getResponseLanguage(this.read, this.sender);
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

        const assoc = new RocketChatAssociationRecord(
            RocketChatAssociationModel.ROOM,
            `${this.room.id}/${this.room.slugifiedName}`
        );
        const userLocation = (
            await this.read.getPersistenceReader().readByAssociation(assoc)
        )[0] as { userLocation?: string } | undefined;
        const locationValue = userLocation?.userLocation;

        switch (command) {
            case "help":
                await handler.Help();
                break;
            case "create":
                if (subCommand) {
                    const roomAlreadyExists = await this.read
                        .getRoomReader()
                        .getByName(`askTrip-${subCommand}`);
                    if (roomAlreadyExists) {
                        notifyMessage(
                            this.room,
                            this.read,
                            this.sender,
                            t("Trip_Channel_Already_Exists", language, {
                                channel: subCommand,
                            })
                        );
                        return;
                    }
                    const createRoom = await storeRoomName(
                        this.room,
                        this.read,
                        this.sender,
                        this.persis,
                        subCommand
                    );
                    if (createRoom) {
                        await handler.Create(subCommand);
                        notifyMessage(
                            this.room,
                            this.read,
                            this.sender,
                            t("Trip_Channel_Created", language, {
                                channelname: subCommand,
                            })
                        );
                    } else {
                        notifyMessage(
                            this.room,
                            this.read,
                            this.sender,
                            t("Failed_To_Create_Trip_Channel", language, {
                                channel: subCommand,
                            })
                        );
                    }
                } else {
                    notifyMessage(
                        this.room,
                        this.read,
                        this.sender,
                        t("Provide_Trip_Channel_Name", language)
                    );
                }
                break;
            case "reminder":
                await handler.reminder();
                break;
            case "location":
                sendGetLocationMessage(
                    this.app,
                    this.read,
                    this.modify,
                    this.room,
                    this.sender,
                    locationValue
                        ? t("Current_Location_Message", language, {
                              location: locationValue,
                          })
                        : t("Share_Location_Request", language)
                );
                break;
            case "info":
                await handler.Info();
                break;

            case "start":
                await handler.getDefaultNotification();
                break;

            case "emergency":
                await handler.emergency();
                break;

            default:
                notifyMessage(
                    this.room,
                    this.read,
                    this.sender,
                    t("Invalid_Command_Message", language, {
                        command,
                    })
                );
        }
    }
}
