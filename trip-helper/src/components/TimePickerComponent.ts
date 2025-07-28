import {
    InputBlock,
    InputElementDispatchAction,
    TimePickerElement,
} from "@rocket.chat/ui-kit";
import { TripHelperApp } from "../../TripHelperApp";
import { ElementInteractionParam } from "../definition/ui-kit/Element/IElementBuilder";

export function timePickerComponent(
    {
        app,
        placeholder,
        label,
        initialValue,
        dispatchActionConfig,
    }: {
        app: TripHelperApp;
        placeholder?: string;
        label?: string;
        initialValue?: string;
        dispatchActionConfig?: InputElementDispatchAction[];
    },
    { blockId, actionId }: ElementInteractionParam
) {
    const { elementBuilder, blockBuilder } = app.getUtils();

    const timePickerElement = elementBuilder.createTimePicker(
        {
            placeholder,
            initialTime: initialValue,
            dispatchActionConfig,
        },
        {
            blockId,
            actionId,
        }
    );

    const timePickerBlock = blockBuilder.createInputBlock({
        text: label,
        element: timePickerElement,
        optional: false,
    });

    return timePickerBlock;
}

export function datePickerComponent(
    {
        app,
        placeholder,
        label,
        initialValue,
        dispatchActionConfig,
    }: {
        app: TripHelperApp;
        placeholder?: string;
        label?: string;
        initialValue?: string;
        dispatchActionConfig?: InputElementDispatchAction[];
    },
    { blockId, actionId }: ElementInteractionParam
) {
    const { elementBuilder, blockBuilder } = app.getUtils();

    const datePickerElement = elementBuilder.createDatePicker(
        {
            placeholder,
            initialDate: initialValue,
            dispatchActionConfig,
        },
        {
            blockId,
            actionId,
        }
    );

    const datePickerBlock = blockBuilder.createInputBlock({
        text: label,
        element: datePickerElement,
        optional: false,
    });

    return datePickerBlock;
}
