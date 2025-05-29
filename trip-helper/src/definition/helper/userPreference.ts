export type AIProviderType = AIProviderEnum.Llama3_2 | AIProviderEnum.Llama3_3;

export enum AIProviderEnum {
    Llama3_2 = "Llama 3.2 Vision 11B",
    Llama3_3 = "Llama 3.3 Vision 11B",
}

export interface IPreference {
    userId: string;
    AIconfiguration: {
        AIProvider: AIProviderType;
        Llama3_2: {
            apiKey: string;
            endpoint: string;
        };
        Llama3_3: {
            apiKey: string;
            endpoint: string;
        };
    };
}
