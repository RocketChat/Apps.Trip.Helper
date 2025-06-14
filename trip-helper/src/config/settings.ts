import { IRead } from "@rocket.chat/apps-engine/definition/accessors";
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

export async function getAPIConfig(read: IRead) {
    try {
        const envReader = read.getEnvironmentReader().getSettings();
        const [apiKey, modelType, apiEndpoint] = await Promise.all([
            envReader.getValueById("api_key"),
            envReader.getValueById("model_type"),
            envReader.getValueById("api_endpoint"),
        ]);
        return { apiKey, modelType, apiEndpoint };
    } catch (error) {
        console.error("Error fetching API config:", error);
        return {
            apiKey: "",
            modelType: "",
            apiEndpoint: "",
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
