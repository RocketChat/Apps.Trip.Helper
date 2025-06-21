import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { TripHelperApp } from "../../TripHelperApp";
import {
    IUIKitErrorResponse,
    IUIKitResponse,
    UIKitBlockInteractionContext,
    UIKitViewSubmitInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { notifyMessage } from "../helpers/Message";
import { RoomInteractionStorage } from "../storage/RoomInteraction";

export interface IJobFormData {
    whenTime: string;
    message: string;
}

export class ExecuteViewSubmit {
    private context: UIKitViewSubmitInteractionContext;

    constructor(
        protected readonly app: TripHelperApp,
        protected readonly read: IRead,
        protected readonly persistence: IPersistence,
        protected readonly modify: IModify,
        context: UIKitViewSubmitInteractionContext
    ) {
        this.context = context;
    }

    public async handleActions(): Promise<IUIKitResponse> {
        const { view, user, triggerId } = this.context.getInteractionData();
        const persistenceRead = this.read.getPersistenceReader();
        const roomInteractionStorage = new RoomInteractionStorage(
            this.persistence,
            persistenceRead,
            user.id
        );
        const roomId = await roomInteractionStorage.getInteractionRoomId();
        const room = (await this.read.getRoomReader().getById(roomId)) as IRoom;

        const viewId = view.id;
        switch (viewId) {
            case "user-reminder-modal":
                return this.handleCreate(room, user, view, triggerId);
        }
        return this.context.getInteractionResponder().errorResponse();
    }

    public async handleCreate(
        room: IRoom,
        user: IUser,
        view: any,
        triggerId: string
    ): Promise<IUIKitResponse> {
        const timeStateValue =
            view.state?.["time-input-block"]?.["time-input-action"];
        const messageStateValue =
            view.state?.["message-input-block"]?.["message-input-action"];

        const validation = await this.formValidation(
            timeStateValue,
            messageStateValue
        );

        if (validation !== true) {
            await notifyMessage(
                room,
                this.read,
                user,
                `${
                    user.username
                }, please fix the following errors: ${JSON.stringify(
                    validation
                )}`
            );
            return this.context.getInteractionResponder().viewErrorResponse({
                viewId: view.id,
                errors: validation,
            });
        }
        const formData: IJobFormData = {
            whenTime: timeStateValue,
            message: messageStateValue,
        };

        const when = new Date();
        const [hours, minutes] = formData.whenTime.split(":").map(Number);
        when.setHours(hours, minutes, 0, 0);

        const jobId = await this.modify.getScheduler().scheduleOnce({
            id: "trip-helper-scheduled-task",
            when: when.toISOString(),
            data: {
                user: user,
                room: room,
                message: formData.message,
            },
        });

        if (!jobId) {
            await notifyMessage(
                room,
                this.read,
                user,
                "Failed to schedule the reminder. Please try again later."
            );
            return this.context.getInteractionResponder().errorResponse();
        }

        await notifyMessage(
            room,
            this.read,
            user,
            `Reminder set for ${formData.whenTime}: "${formData.message}"`
        );
        return this.context.getInteractionResponder().successResponse();
    }

    private async formValidation(
        whenTime: string,
        message: string
    ): Promise<Record<string, string> | true> {
        if (!message) {
            return { message: "Message cannot be empty" };
        }
        if (!whenTime) {
            return { whenTime: "Time cannot be empty" };
        }
        const now = new Date();
        const [hours, minutes] = whenTime.split(":").map(Number);
        const inputTime = new Date(now);
        inputTime.setHours(hours, minutes, 0, 0);

        if (inputTime.getTime() <= now.getTime()) {
            const diff = now.getTime() - inputTime.getTime();
            if (diff > 12 * 60 * 60 * 1000) {
                // Add 1 day to inputTime
                inputTime.setDate(inputTime.getDate() + 1);
            }
        }

        if (inputTime.getTime() <= now.getTime()) {
            return { whenTime: "Time must be in the future" };
        }
        return true;
    }
}
