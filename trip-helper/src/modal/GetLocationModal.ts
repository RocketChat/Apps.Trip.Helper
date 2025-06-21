import {
    IModify,
    IUIKitSurfaceViewParam,
} from "@rocket.chat/apps-engine/definition/accessors";

import {
    ButtonStyle,
    UIKitSurfaceType,
} from "@rocket.chat/apps-engine/definition/uikit";
import { DividerBlock, InputBlock, TextObjectType } from "@rocket.chat/ui-kit";
import { inputElementComponent } from "../components/InputElementComponent";

export async function getLocationModal({
    app,
    modify,
}): Promise<IUIKitSurfaceViewParam> {
    const { elementBuilder, blockBuilder } = app.getUtils();
    const blocks: (InputBlock | DividerBlock)[] = [];

    const locationInput = inputElementComponent(
        {
            app,
            placeholder: "Enter your location",
            label: "Location",
            optional: false,
            multiline: true,
            minLength: 5,
            maxLength: 100,
            initialValue: "",
            dispatchActionConfigOnInput: true,
        },
        {
            blockId: "Location_Input",
            actionId: "Location_Input_Action",
        }
    );
    blocks.push(locationInput);

    const submitButton = elementBuilder.addButton(
        {
            text: "Submit",
            style: ButtonStyle.PRIMARY,
        },
        {
            blockId: "Location_Submit",
            actionId: "Location_Submit_Action",
        }
    );
    const closeButton = elementBuilder.addButton(
        {
            text: "Close",
            style: ButtonStyle.DANGER,
        },
        {
            blockId: "Location_Close",
            actionId: "Location_Close_Action",
        }
    );

    return {
        id: "location_modal",
        type: UIKitSurfaceType.MODAL,
        title: {
            type: TextObjectType.MRKDWN,
            text: "Select your Location",
        },
        blocks: blocks,
        close: closeButton,
        submit: submitButton,
    };
}
