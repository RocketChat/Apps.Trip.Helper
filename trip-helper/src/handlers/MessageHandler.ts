import { IHttp, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { getAPIConfig } from "../config/settings";

export class MessageHandler {
    constructor(private readonly http: IHttp, private readonly read: IRead) {}

    public async sendMessage(
        message: string,
        location: string
    ): Promise<string> {
        const { apiKey, modelType, apiEndpoint } = await getAPIConfig(
            this.read
        );
        if (!apiKey || !modelType || !apiEndpoint) {
            return "API configuration is missing. Please contact the admin.";
        }
        const requestBody = await this.createMessageRequest(
            message,
            location,
            modelType
        );
        try {
            const response = await this.sendResponseRequest(
                apiEndpoint,
                apiKey,
                requestBody
            );
            return response;
        } catch (error) {
            return `Failed to send message: ${error.message}`;
        }
    }
    private async createMessageRequest(
        message: string,
        location: string,
        modelType: string
    ) {
        return {
            model: modelType,
            messages: [
                {
                    role: "system",
                    content: `You are a helpful assistant. The user is currently at ${location}.`,
                },
                {
                    role: "user",
                    content: message,
                },
            ],
        };
    }

    private async sendResponseRequest(
        apiEndpoint: string,
        apiKey: string,
        requestBody: any
    ): Promise<string> {
        try {
            const response = await this.http.post(apiEndpoint, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                data: requestBody,
            });
            return response.data.choices[0].message.content;
        } catch (error) {
            throw new Error(`Failed to send request: ${error.message}`);
        }
    }
}
