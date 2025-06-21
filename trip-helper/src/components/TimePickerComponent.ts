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
