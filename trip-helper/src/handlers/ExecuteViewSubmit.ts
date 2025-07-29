import {
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { TripHelperApp } from "../../TripHelperApp";
import {
    IUIKitResponse,
    UIKitViewSubmitInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { notifyMessage } from "../helpers/Message";
import { RoomInteractionStorage } from "../storage/RoomInteraction";
import { IJobFormData } from "../definition/storage/IJobFormData";

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
            view.state?.["time-input-block"]?.["time-input-action"] ||
            view.initialState?.["time-input-block"]?.["time-input-action"];
        const messageStateValue =
            view.state?.["message-input-block"]?.["message-input-action"] ||
            view.initialState?.["message-input-block"]?.[
                "message-input-action"
            ];
        const dateStateValue =
            view.state?.["date-input-block"]?.["date-input-action"] ||
            view.initialState?.["date-input-block"]?.["date-input-action"];

        const validation = await this.formValidation(
            timeStateValue,
            messageStateValue,
            dateStateValue
        );

        if (validation !== true) {
            await notifyMessage(
                room,
                this.read,
                user,
                `${
                    user.name || user.username
                }, Please fix the following errors: ${JSON.stringify(
                    validation
                )}`
            );
            return this.context.getInteractionResponder().viewErrorResponse({
                viewId: view.id,
                errors: validation,
            });
        }
        const formData: IJobFormData = {
            whenDate: dateStateValue,
            whenTime: timeStateValue,
            message: messageStateValue,
        };

        const [year, month, day] = formData.whenDate.split("-").map(Number);
        const [hours, minutes] = formData.whenTime.split(":").map(Number);

        const when = new Date(year, month - 1, day, hours, minutes, 0, 0);

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
            `Reminder set for **${when}**: **${formData.message}**`
        );
        return this.context.getInteractionResponder().successResponse();
    }

    private async formValidation(
        whenTime: string,
        message: string,
        date: string
    ): Promise<Record<string, string> | true> {
        if (!date) {
            return { date: "Date cannot be empty" };
        }
        if (!message) {
            return { message: "Message cannot be empty" };
        }
        if (!whenTime) {
            return { whenTime: "Time cannot be empty" };
        }
        const [year, month, day] = date.split("-").map(Number);
        const [hours, minutes] = whenTime.split(":").map(Number);

        const scheduledTime = new Date(
            year,
            month - 1,
            day,
            hours,
            minutes,
            0,
            0
        );
        const now = new Date();

        if (scheduledTime.getTime() <= now.getTime()) {
            return {
                whenTime: "The selected date and time must be in the future",
            };
        }
        return true;
    }
}
