import {
    IModify,
    IUIKitSurfaceViewParam,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { TripHelperApp } from "../../TripHelperApp";
import { DividerBlock, InputBlock, TextObjectType } from "@rocket.chat/ui-kit";
import {
    ButtonStyle,
    UIKitSurfaceType,
} from "@rocket.chat/apps-engine/definition/uikit";
import { inputElementComponent } from "../components/InputElementComponent";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { timePickerComponent } from "../components/TimePickerComponent";
import { datePickerComponent } from "../components/DatePickerComponent";
import { selectComponent } from "../components/SelectComponent";
import { LocationEvent } from "../definition/handlers/EventHandler";
import { 
    createReminderOptionsFromEvents, 
    getReminderOptionByValue, 
    ReminderOption
} from "../const/reminderOptions";
import { getStoredLocationEvents } from "../storage/EventStorage";

export async function UserReminderModal({
    app,
    modify,
    read,
    room,
    eventResponse,
    selectedReminderOption,
}: {
    app: TripHelperApp;
    modify: IModify;
    read: IRead;
    room: IRoom;
    eventResponse?: LocationEvent;
    selectedReminderOption?: string;
}): Promise<IUIKitSurfaceViewParam> {
    const { elementBuilder } = app.getUtils();
    const blocks: (InputBlock | DividerBlock)[] = [];
    const now = new Date();
    
    // Get stored events from EventStorage
    const storedEvents = await getStoredLocationEvents(read, room);
    
    // Create reminder options from stored events
    const reminderOptions = createReminderOptionsFromEvents(storedEvents);
    
    // Get the selected reminder option or default to custom
    const reminderOptionValue = selectedReminderOption || "custom";
    const viewId = `user-reminder-modal-${reminderOptionValue}`;
    const reminderOption = getReminderOptionByValue(reminderOptions, reminderOptionValue);
    
    // Calculate date and time based on selected option
    let date: string;
    let time: string;
    let message: string;
    
    if (reminderOption && reminderOptionValue !== "custom") {
        date = reminderOption.date;
        time = reminderOption.time;
        message = reminderOption.message;
        console.log(`Selected option: ${reminderOptionValue}, Date: ${date}, Time: ${time}, Message: ${message}`);
    } else {
        // Use existing logic for custom or fallback
        date = eventResponse?.date || now.toISOString().split("T")[0];
        time = eventResponse?.time || now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
        message = `Remind me for ${eventResponse?.title || ""}`;
        console.log(`Custom option - Date: ${date}, Time: ${time}, Message: ${message}`);
    }

    // Create reminder type selector
    const reminderTypeSelect = selectComponent(
        {
            app,
            placeholder: "Choose reminder type",
            label: "Reminder Type",
            options: reminderOptions.map(option => ({
                text: option.text,
                value: option.value,
                description: `${option.date} at ${option.time}`,
            })),
            initialValue: reminderOptionValue,
            dispatchActionConfig: ["on_item_selected"],
        },
        {
            blockId: "reminder-type-block",
            actionId: "reminder-type-action",
        }
    );

    const reminderDateInput = datePickerComponent(
        {
            app,
            placeholder: "YYYY-MM-DD",
            label: "Reminder Date",
            initialValue: date,
            dispatchActionConfig: ["on_character_entered"],
        },
        {
            blockId: `date-input-block-${reminderOptionValue}`,
            actionId: `date-input-action-${reminderOptionValue}`,
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
            blockId: `time-input-block-${reminderOptionValue}`,
            actionId: `time-input-action-${reminderOptionValue}`,
        }
    );

    const reminderMessageInput = inputElementComponent(
        {
            app,
            placeholder: "Happy hour start! 🎉 🍣",
            label: "Message",
            initialValue: message,
            optional: false,
            multiline: true,
        },
        {
            blockId: `message-input-block-${reminderOptionValue}`,
            actionId: `message-input-action-${reminderOptionValue}`,
        }
    );

    blocks.push(reminderTypeSelect, reminderDateInput, reminderTimeInput, reminderMessageInput);

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
