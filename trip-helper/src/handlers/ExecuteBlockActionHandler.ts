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
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { UserHandler } from "./UserHandler";
import { getLocationModal } from "../modal/GetLocationModal";

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
        const { triggerId } = this.context.getInteractionData();
        let { room } = this.context.getInteractionData();
        const appUser = (await this.read.getUserReader().getAppUser()) as IUser;

        const persistenceRead = this.read.getPersistenceReader();

        const roomInteractionStorage = new RoomInteractionStorage(
            this.persistence,
            persistenceRead,
            user.id
        );

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
        const userHandler = new UserHandler(
            this.app,
            this.read,
            this.modify,
            room,
            user
        );
        switch (actionId) {
            case "Location_Accept":
                await userHandler.confirmLocationAccepted();
                return this.context.getInteractionResponder().successResponse();
            case "Location_Neglect":
                await userHandler.noLocationDetected();
                return this.context.getInteractionResponder().successResponse();
            case "Location_Request_Action":
                const locationModal = await getLocationModal({
                    app: this.app,
                    modify: this.modify,
                });
                return this.context
                    .getInteractionResponder()
                    .openModalViewResponse(locationModal);
            case "Neglect_Location_Action":
                await userHandler.noLocationDetectedAndNotProvided();

            default:
                return this.context.getInteractionResponder().successResponse();
        }
    }
}
