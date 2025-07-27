import { InputBlock, InputElementDispatchAction } from "@rocket.chat/ui-kit";
import { TripHelperApp } from "../../TripHelperApp";
import { ElementInteractionParam } from "../definition/ui-kit/Element/IElementBuilder";
import { StaticSelectOptionsParam } from "../definition/ui-kit/Element/IStaticSelectElement";

export function selectComponent(
    {
        app,
        placeholder,
        label,
        options,
        initialValue,
        dispatchActionConfig,
    }: {
        app: TripHelperApp;
        placeholder: string;
        label: string;
        options: StaticSelectOptionsParam;
        initialValue?: string;
        dispatchActionConfig?: Array<InputElementDispatchAction>;
    },
    { blockId, actionId }: ElementInteractionParam
): InputBlock {
    const { elementBuilder, blockBuilder } = app.getUtils();
    
    const selectOptions = elementBuilder.createDropDownOptions(options);
    
    const staticSelectElement = elementBuilder.addDropDown(
        {
            placeholder,
            options: selectOptions,
            initialValue,
            dispatchActionConfig,
        },
        {
            blockId,
            actionId,
        }
    );

    const inputBlock = blockBuilder.createInputBlock({
        blockId,
        element: staticSelectElement,
        label: {
            type: "plain_text",
            text: label,
        },
    });

    return inputBlock;
}
