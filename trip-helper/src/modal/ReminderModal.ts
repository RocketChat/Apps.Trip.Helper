import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
    IUIKitSurfaceViewParam,
} from "@rocket.chat/apps-engine/definition/accessors";
import { TripHelperApp } from "../../TripHelperApp";
import { DividerBlock, InputBlock, TextObjectType } from "@rocket.chat/ui-kit";
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
import { Language } from "../translation/translation";
import { tAsync } from "../translation/translator";

export async function UserReminderModal({
    app,
    modify,
    read,
    http,
    persis,
    room,
    eventResponse,
    language,
}: {
    app: TripHelperApp;
    modify: IModify;
    read: IRead;
    http: IHttp;
    persis: IPersistence;
    room: IRoom;
    eventResponse?: LocationEvent;
    language: Language;
}): Promise<IUIKitSurfaceViewParam> {
    const viewId = `user-reminder-modal`;
    const { elementBuilder, blockBuilder } = app.getUtils();
    const blocks: (InputBlock | DividerBlock)[] = [];
    const now = new Date();
    let date: string = "";
    let time: string = "";
    let initialMessage: string = "";

    if (eventResponse) {
        if (eventResponse.date && eventResponse.date.trim() !== "") {
            date = eventResponse.date;
        }
        if (eventResponse.time && eventResponse.time.trim() !== "") {
            time = eventResponse.time;
        }
        if (eventResponse.title) {
            initialMessage = await tAsync(
                "Reminder_Default_Event_Message",
                language,
                read,
                http,
                persis,
                {
                    event: eventResponse.title,
                }
            );
        }
    }

    if (!date || isNaN(Date.parse(date))) {
        date = now.toISOString().split("T")[0];
    }
    if (!time || !/^\d{2}:\d{2}$/.test(time)) {
        time = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    }

    const reminderDateInput = datePickerComponent(
        {
            app,
            placeholder: await tAsync(
                "Reminder_Date_Placeholder",
                language,
                read,
                http,
                persis
            ),
            label: await tAsync(
                "Reminder_Date_Label",
                language,
                read,
                http,
                persis
            ),
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
            placeholder: await tAsync(
                "Reminder_Time_Placeholder",
                language,
                read,
                http,
                persis
            ),
            label: await tAsync(
                "Reminder_Time_Label",
                language,
                read,
                http,
                persis
            ),
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
            placeholder: await tAsync(
                "Reminder_Message_Placeholder",
                language,
                read,
                http,
                persis
            ),
            label: await tAsync(
                "Reminder_Message_Label",
                language,
                read,
                http,
                persis
            ),
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
            text: await tAsync(
                "Reminder_Submit_Button",
                language,
                read,
                http,
                persis
            ),
            style: ButtonStyle.PRIMARY,
        },
        {
            blockId: "confirm-reminder-block",
            actionId: "confirm-reminder-action",
        }
    );

    const closeButton = elementBuilder.addButton(
        {
            text: await tAsync(
                "Reminder_Close_Button",
                language,
                read,
                http,
                persis
            ),
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
            text: await tAsync(
                "Reminder_Modal_Title",
                language,
                read,
                http,
                persis
            ),
        },
        blocks: blocks,
        close: closeButton,
        submit: submitButton,
        ...({
            initialState: {
                "date-input-block": {
                    "date-input-action": date,
                },
                "time-input-block": {
                    "time-input-action": time,
                },
                "message-input-block": {
                    "message-input-action": initialMessage,
                },
            },
        } as any),
    };
}
