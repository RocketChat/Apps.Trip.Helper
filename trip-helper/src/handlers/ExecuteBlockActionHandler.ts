import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    IUIKitResponse,
    UIKitBlockInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { RoomInteractionStorage } from "../storage/RoomInteraction";
import { TripHelperApp } from "../../TripHelperApp";
import { UserHandler } from "./UserHandler";
import { sendGetLocationMessage } from "../helpers/Notifications";
import { CommandHandler } from "./CommandHandler";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";
import { notifyMessage } from "../helpers/Message";

export class ExecuteBlockActionHandler {
    private context: UIKitBlockInteractionContext;
    constructor(
        protected readonly app: TripHelperApp,
        protected readonly read: IRead,
        protected readonly http: IHttp,
        protected readonly persistence: IPersistence,
        protected readonly modify: IModify,
        context: UIKitBlockInteractionContext
    ) {
        this.context = context;
    }
    public async handleActions(): Promise<IUIKitResponse> {
        const { actionId, user } = this.context.getInteractionData();
        let { room } = this.context.getInteractionData();
        const persistenceRead = this.read.getPersistenceReader();

        const roomInteractionStorage = new RoomInteractionStorage(
            this.persistence,
            persistenceRead,
            user.id
        );
        const { triggerId } = this.context.getInteractionData();

        const roomId = await roomInteractionStorage.getInteractionRoomId();
        const roomPersistance = await this.read.getRoomReader().getById(roomId);

        if (room === undefined) {
            if (roomPersistance) {
                room = roomPersistance;
            } else {
                console.error("Room doesn't exist");
                return this.context.getInteractionResponder().errorResponse();
            }
        }

        const commandHandler = new CommandHandler({
            app: this.app,
            sender: user,
            room: room,
            read: this.read,
            modify: this.modify,
            http: this.http,
            persis: this.persistence,
            triggerId: triggerId,
        });
        const userHandler = new UserHandler(
            this.app,
            this.read,
            this.modify,
            room,
            user,
            this.http,
            this.persistence,
            triggerId
        );
        switch (actionId) {
            case "Location_Accept":
                await userHandler.confirmLocationAccepted();
                return this.context.getInteractionResponder().successResponse();

            case "Location_Neglect":
                await userHandler.noLocationDetected();
                return this.context.getInteractionResponder().successResponse();

            case "Location_Request_Action":
                await userHandler.locationDetectedThroughIP();
                return this.context.getInteractionResponder().successResponse();

            case "Neglect_Location_Action":
                await userHandler.noLocationDetectedAndNotProvided();
                return this.context.getInteractionResponder().successResponse();

            case "Set_Reminder_Action":
                await userHandler.reminder();
                return this.context.getInteractionResponder().successResponse();

            case "Set_Reminder_Action_1":
                await userHandler.setReminder_1();
                return this.context.getInteractionResponder().successResponse();

            case "Set_Reminder_Action_2":
                await userHandler.setReminder_2();
                return this.context.getInteractionResponder().successResponse();

            case "Set_Reminder_Action_3":
                await userHandler.setReminder_3();
                return this.context.getInteractionResponder().successResponse();

            case "Show_Info_Action":
                await commandHandler.Info();
                return this.context.getInteractionResponder().successResponse();

            case "Need_More_Action":
                await commandHandler.Help();
                return this.context.getInteractionResponder().successResponse();

            case "Set_Reminder_Getting_Started_Action":
                await commandHandler.reminder();
                return this.context.getInteractionResponder().successResponse();

            case "Set_Channel_Action":
                const assoc = new RocketChatAssociationRecord(
                    RocketChatAssociationModel.ROOM,
                    `channelrequest${user.id}`
                );
                const data = (await this.read
                    .getPersistenceReader()
                    .readByAssociation(assoc)) as Array<{
                    channelName: string;
                }>;

                const channelName = data?.[0]?.channelName;

                if (channelName) {
                    await commandHandler.Create(channelName);
                } else {
                    notifyMessage(room, this.read, user, "name not valid");
                }
                return this.context.getInteractionResponder().successResponse();

            case "Show_Location_Action":
                sendGetLocationMessage(
                    this.app,
                    this.read,
                    this.modify,
                    room,
                    user,
                    "Share your Location with us, We will use your device **IP address** to get your location"
                );
                return this.context.getInteractionResponder().successResponse();

            default:
                return this.context.getInteractionResponder().successResponse();
        }
    }
}
