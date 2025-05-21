import {
    IModify,
    IUIKitSurfaceViewParam,
} from "@rocket.chat/apps-engine/definition/accessors";
import { TripHelperApp } from "../../TripHelperApp";
import { AIProviderEnum, IPreference } from "../storage/UserPreferenceStorage";
import { UserPreferenceModalEnum } from "../enum/modal/UserPreferenceModal";
import { DividerBlock, InputBlock, TextObjectType } from "@rocket.chat/ui-kit";
import {
    ButtonStyle,
    UIKitSurfaceType,
} from "@rocket.chat/apps-engine/definition/uikit";
import { inputElementComponent } from "./InputElementComponent";

export enum Modals {
    dispatchActionConfigOnInput = "on_character_entered",
    dispatchActionConfigOnSelect = "on_item_selected",
}

export async function UserPreferenceModal({
    app,
    modify,
    existingPreference,
}: {
    app: TripHelperApp;
    modify: IModify;
    existingPreference: IPreference;
}): Promise<IUIKitSurfaceViewParam> {
    const viewId = UserPreferenceModalEnum.VIEW_ID;
    const { elementBuilder, blockBuilder } = app.getUtils();
    const blocks: (InputBlock | DividerBlock)[] = [];
    const aiProviderOptions = [
        {
            text: AIProviderEnum.Llama3_2,
            value: AIProviderEnum.Llama3_2,
        },
        {
            text: AIProviderEnum.Llama3_3,
            value: AIProviderEnum.Llama3_3,
        },
    ];

    const aiProviderDropDownOption =
        elementBuilder.createDropDownOptions(aiProviderOptions);

    const aiProviderDropDown = elementBuilder.addDropDown(
        {
            placeholder: "Choose AI Provider Placeholder",
            options: aiProviderDropDownOption,
            dispatchActionConfig: [Modals.dispatchActionConfigOnSelect],
            initialOption: aiProviderDropDownOption.find(
                (option) =>
                    option.value ===
                    existingPreference.AIconfiguration?.AIProvider
            ),
        },
        {
            blockId: UserPreferenceModalEnum.AI_OPTION_DROPDOWN_BLOCK_ID,
            actionId: UserPreferenceModalEnum.AI_OPTION_DROPDOWN_ACTION_ID,
        }
    );

    blocks.push(
        blockBuilder.createInputBlock({
            text: "Choose_AI_Provider_Label",
            element: aiProviderDropDown,
            optional: false,
        })
    );

    const openAIAPIKeyInput = inputElementComponent(
        {
            app,
            placeholder: "Open_AI_API_Key_Placeholder",
            label: "Open_AI_API_Key_Label",
            optional: false,
            initialValue: existingPreference?.AIconfiguration?.Llama3_2?.apiKey,
        },
        {
            blockId: UserPreferenceModalEnum.Llama_API_KEY_BLOCK_ID,
            actionId: UserPreferenceModalEnum.Llama_API_KEY_ACTION_ID,
        }
    );

    const openAIModelInput = inputElementComponent(
        {
            app,
            placeholder: "Open_AI_Model_Placeholder",
            label: "Open_AI_Model_Label",
            optional: false,
            initialValue:
                existingPreference?.AIconfiguration?.Llama3_2?.endpoint,
        },
        {
            blockId: UserPreferenceModalEnum.Llama_Endpoint_BLOCK_ID,
            actionId: UserPreferenceModalEnum.Llama_Endpoint_ACTION_ID,
        }
    );

    blocks.push(openAIAPIKeyInput, openAIModelInput);

    const submitButton = elementBuilder.addButton(
        {
            text: UserPreferenceModalEnum.UPDATE,
            style: ButtonStyle.PRIMARY,
        },
        {
            actionId: UserPreferenceModalEnum.SUBMIT_ACTION_ID,
            blockId: UserPreferenceModalEnum.SUBMIT_BLOCK_ID,
        }
    );

    const closeButton = elementBuilder.addButton(
        {
            text: UserPreferenceModalEnum.CLOSE,
            style: ButtonStyle.DANGER,
        },
        {
            actionId: UserPreferenceModalEnum.CLOSE_ACTION_ID,
            blockId: UserPreferenceModalEnum.CLOSE_BLOCK_ID,
        }
    );
    return {
        id: viewId,
        type: UIKitSurfaceType.MODAL,
        title: {
            type: TextObjectType.MRKDWN,
            text: "User_Preference_Title",
        },
        blocks: blocks,
        close: closeButton,
        submit: submitButton,
    };
}
