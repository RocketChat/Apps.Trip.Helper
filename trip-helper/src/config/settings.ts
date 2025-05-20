import {
    ISetting,
    SettingType,
} from "@rocket.chat/apps-engine/definition/settings";

export enum Settings {
    MODEL_TYPE = "model_type",
    API_KEY = "api_key",
    API_ENDPOINT = "api_endpoint",
}

export const settings: ISetting[] = [
    {
        id: Settings.MODEL_TYPE,
        type: SettingType.SELECT,
        i18nLabel: "Model selection",
        i18nDescription: "AI model to be used for inference.",
        values: [
            {
                key: "meta-llama/Llama-3.2-11B-Vision-Instruct",
                i18nLabel: "Llama 3.2 Vision 11B",
            },
            {
                key: "meta-llama/Llama-3.3-11B-Vision-Instruct",
                i18nLabel: "Llama 3.3 Vision 11B",
            },
        ],
        required: true,
        public: true,
        packageValue: "meta-llama/Llama-3.2-11B-Vision-Instruct",
    },
    {
        id: Settings.API_KEY,
        type: SettingType.PASSWORD,
        i18nLabel: "API Key",
        i18nDescription: "API Key to access the LLM Model.",
        i18nPlaceholder: "",
        required: true,
        public: false,
        packageValue: "",
    },
    {
        id: Settings.API_ENDPOINT,
        type: SettingType.STRING,
        i18nLabel: "API Endpoint",
        i18nDescription: "API endpoint to be used for inference.",
        required: true,
        public: true,
        packageValue: "",
    },
];
