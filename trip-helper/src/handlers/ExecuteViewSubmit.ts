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
        const reminderTypeValue =
            view.state?.["reminder-type-block"]?.["reminder-type-action"];
        
        // Find the dynamic block IDs based on the selected reminder type
        let dateStateValue, timeStateValue, messageStateValue;
        
        // Try to find the values from dynamic block IDs
        for (const blockId in view.state || {}) {
            if (blockId.startsWith("date-input-block-")) {
                const actionId = Object.keys(view.state[blockId])[0];
                dateStateValue = view.state[blockId][actionId];
            } else if (blockId.startsWith("time-input-block-")) {
                const actionId = Object.keys(view.state[blockId])[0];
                timeStateValue = view.state[blockId][actionId];
            } else if (blockId.startsWith("message-input-block-")) {
                const actionId = Object.keys(view.state[blockId])[0];
                messageStateValue = view.state[blockId][actionId];
            }
        }

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

        // Parse the date if provided
        let targetDate = new Date();
        if (dateStateValue) {
            targetDate = new Date(dateStateValue);
        }

        const [hours, minutes] = formData.whenTime.split(":").map(Number);
        targetDate.setHours(hours, minutes, 0, 0);

        // If the time has passed today, schedule for tomorrow
        if (targetDate.getTime() <= Date.now()) {
            targetDate.setDate(targetDate.getDate() + 1);
        }

        const jobId = await this.modify.getScheduler().scheduleOnce({
            id: "trip-helper-scheduled-task",
            when: targetDate.toISOString(),
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
            `Reminder set for ${targetDate.toLocaleString()}: "${formData.message}"`
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
                inputTime.setDate(inputTime.getDate() + 1);
            }
        }

        if (inputTime.getTime() <= now.getTime()) {
            return { whenTime: "Time must be in the future" };
        }
        return true;
    }
}
