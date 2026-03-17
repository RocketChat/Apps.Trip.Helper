import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
    IUIKitSurfaceViewParam,
} from "@rocket.chat/apps-engine/definition/accessors";

import {
    ButtonStyle,
    UIKitSurfaceType,
} from "@rocket.chat/apps-engine/definition/uikit";
import { DividerBlock, InputBlock, TextObjectType } from "@rocket.chat/ui-kit";
import { inputElementComponent } from "../components/InputElementComponent";
import { TripHelperApp } from "../../TripHelperApp";
import { Language } from "../translation/translation";
import { tAsync } from "../translation/translator";

export async function getLocationModal({
    app,
    modify,
    read,
    http,
    persis,
    language,
}: {
    app: TripHelperApp;
    modify: IModify;
    read: IRead;
    http: IHttp;
    persis: IPersistence;
    language: Language;
}): Promise<IUIKitSurfaceViewParam> {
    const { elementBuilder, blockBuilder } = app.getUtils();
    const blocks: (InputBlock | DividerBlock)[] = [];

    const locationInput = inputElementComponent(
        {
            app,
            placeholder: await tAsync(
                "Enter_Your_Location",
                language,
                read,
                http,
                persis
            ),
            label: await tAsync(
                "Location_Label",
                language,
                read,
                http,
                persis
            ),
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
            text: await tAsync("Submit", language, read, http, persis),
            style: ButtonStyle.PRIMARY,
        },
        {
            blockId: "Location_Submit",
            actionId: "Location_Submit_Action",
        }
    );
    const closeButton = elementBuilder.addButton(
        {
            text: await tAsync("Close", language, read, http, persis),
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
            text: await tAsync(
                "Select_Your_Location",
                language,
                read,
                http,
                persis
            ),
        },
        blocks: blocks,
        close: closeButton,
        submit: submitButton,
    };
}
