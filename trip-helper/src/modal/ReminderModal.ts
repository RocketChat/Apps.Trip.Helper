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
import { timePickerComponent } from "../components/TimePickerComponent";

export async function UserReminderModal({
    app,
    modify,
    room,
}: {
    app: TripHelperApp;
    modify: IModify;
    room: IRoom;
}): Promise<IUIKitSurfaceViewParam> {
    const viewId = `user-reminder-modal`;
    const { elementBuilder, blockBuilder } = app.getUtils();
    const blocks: (InputBlock | DividerBlock)[] = [];
    const now = new Date();
    const time = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

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

    // const reminderTimeInput = elementBuilder.createTimePicker(
    //     {
    //         placeholder: "HH:MM",
    //         initialTime: time,
    //         dispatchActionConfig: ["on_time_entered"],
    //     },
    //     {
    //         blockId: "time-input-block",
    //         actionId: "time-input-action",
    //     }
    // );

    // const plainTextInputBlock = blockBuilder.createInputBlock({
    //     text: 'ioi',
    //     element: reminderTimeInput,
    //     optional: false, // Assuming it's not optional, adjust as needed
    // });

    const reminderMessageInput = inputElementComponent(
        {
            app,
            placeholder: "Happy hour start! 🎉 🍣",
            label: "Message",
            optional: false,
            multiline: true,
        },
        {
            blockId: "message-input-block",
            actionId: "message-input-action",
        }
    );

    blocks.push(reminderTimeInput, reminderMessageInput);

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
