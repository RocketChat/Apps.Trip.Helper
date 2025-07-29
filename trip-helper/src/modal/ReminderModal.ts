import {
    IModify,
    IUIKitSurfaceViewParam,
} from "@rocket.chat/apps-engine/definition/accessors";
import { TripHelperApp } from "../../TripHelperApp";
import {
    DividerBlock,
    InputBlock,
    TextObjectType,
    TimePickerElement,
} from "@rocket.chat/ui-kit";
import {
    ButtonStyle,
    UIKitSurfaceType,
} from "@rocket.chat/apps-engine/definition/uikit";
import { inputElementComponent } from "../components/InputElementComponent";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import {
    datePickerComponent,
    timePickerComponent,
} from "../components/TimePickerComponent";
import { LocationEvent } from "../definition/handlers/EventHandler";

export async function UserReminderModal({
    app,
    modify,
    room,
    eventResponse,
}: {
    app: TripHelperApp;
    modify: IModify;
    room: IRoom;
    eventResponse?: LocationEvent;
}): Promise<IUIKitSurfaceViewParam> {
    const viewId = `user-reminder-modal`;
    const { elementBuilder, blockBuilder } = app.getUtils();
    const blocks: (InputBlock | DividerBlock)[] = [];
    const now = new Date();
    let date: string | undefined;
    let time: string | undefined;
    let initialMessage: string = "";

    if (eventResponse) {
        if (eventResponse.date) {
            date = eventResponse.date;
        }
        if (eventResponse.time) {
            time = eventResponse.time;
        }
        if (eventResponse.title) {
            initialMessage = `Remind me for ${eventResponse.title}`;
        }
    }

    if (!date) {
        date = now.toISOString().split("T")[0];
    }
    if (!time) {
        time = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    }

    const reminderDateInput = datePickerComponent(
        {
            app,
            placeholder: "YYYY-MM-DD",
            label: "Reminder Date",
            initialValue: date,
            dispatchActionConfig: ["on_character_entered"],
        },
        {
            blockId: "date-input-block",
            actionId: "date-input-action",
        }
    );

    const reminderTimeInput = timePickerComponent(
        {
            app,
            placeholder: "HH:MM",
            label: "Remind at",
            initialValue: time,
            dispatchActionConfig: ["on_character_entered"],
        },
        {
            blockId: "time-input-block",
            actionId: "time-input-action",
        }
    );

    const reminderMessageInput = inputElementComponent(
        {
            app,
            placeholder: "Happy hour start! 🎉 🍣",
            label: "Message",
            initialValue: initialMessage,
            optional: false,
            multiline: true,
        },
        {
            blockId: "message-input-block",
            actionId: "message-input-action",
        }
    );

    blocks.push(reminderDateInput, reminderTimeInput, reminderMessageInput);

    const submitButton = elementBuilder.addButton(
        {
            text: "Confirm",
            style: ButtonStyle.PRIMARY,
        },
        {
            blockId: "confirm-reminder-block",
            actionId: "confirm-reminder-action",
        }
    );

    const closeButton = elementBuilder.addButton(
        {
            text: "Cancel",
        },
        {
            blockId: "cancel-reminder-block",
            actionId: "cancel-reminder-action",
        }
    );
    return {
        id: viewId,
        type: UIKitSurfaceType.MODAL,
        title: {
            type: TextObjectType.MRKDWN,
            text: "Create Reminder",
        },
        blocks: blocks,
        close: closeButton,
        submit: submitButton,
    };
}
