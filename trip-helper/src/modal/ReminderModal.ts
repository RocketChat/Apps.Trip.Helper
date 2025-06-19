import {
    IModify,
    IUIKitSurfaceViewParam,
} from "@rocket.chat/apps-engine/definition/accessors";
import { TripHelperApp } from "../../TripHelperApp";
import { DividerBlock, InputBlock, TextObjectType } from "@rocket.chat/ui-kit";
import {
    ButtonStyle,
    UIKitSurfaceType,
} from "@rocket.chat/apps-engine/definition/uikit";
import { inputElementComponent } from "./InputElementComponent";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";

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

    const reminderTimeInput = inputElementComponent(
        {
            app,
            placeholder: "HH:MM",
            label: "Remind at:",
            optional: false,
            initialValue: time,
        },
        {
            blockId: "time-input-block",
            actionId: "time-input-action",
        }
    );

    const reminderMessageInput = inputElementComponent(
        {
            app,
            placeholder: "Happy hour start! :tada: :sushi:",
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
