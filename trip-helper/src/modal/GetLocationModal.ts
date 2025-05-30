import {
    IModify,
    IUIKitSurfaceViewParam,
} from "@rocket.chat/apps-engine/definition/accessors";
import { TripHelperApp } from "../../TripHelperApp";
import { inputElementComponent } from "./InputElementComponent";
import {
    ButtonStyle,
    UIKitSurfaceType,
} from "@rocket.chat/apps-engine/definition/uikit";
import { DividerBlock, InputBlock, TextObjectType } from "@rocket.chat/ui-kit";

export async function getLocationModal({
    app,
    modify,
}): Promise<IUIKitSurfaceViewParam> {
    const { elementBuilder, blockBuilder } = app.getUtils();
    const blocks: (InputBlock | DividerBlock)[] = [];
    const locationDropdown = elementBuilder.addDropdown(
        {
            placeholder: "Select a location",
            options: [
                elementBuilder.createOptionBlockObject(
                    "Current Location",
                    "current_location"
                ),
                elementBuilder.createOptionBlockObject(
                    "Saved Locations",
                    "saved_locations"
                ),
                elementBuilder.createOptionBlockObject(
                    "Custom Location",
                    "custom_location"
                ),
            ],
        },
        {
            blockId: "Location_Selection",
            actionId: "Location_Selection_Action",
        }
    );

    blocks.push(
        blockBuilder.createInputBlock({
            text: "Please select your preferred location for the trip:",
            element: locationDropdown,
            optional: false,
        })
    );

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
        type: UIKitSurfaceType.MODAL,
        title: {
            type: TextObjectType.MRKDWN,
            text: "User Preference",
        },
        blocks: blocks,
        close: closeButton,
        submit: submitButton,
    };
}
