import { IHttp, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { getAPIConfig } from "../../config/settings";
import {
    CHANGE_LOCATION_PROMPT,
    CREATE_CHANNEL_PROMPT,
} from "../../const/prompts";

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
        const locationKeywords = [
            "change",
            "set",
            "store",
            "current location",
            "i am in",
            "my location",
            "move to",
            "update location",
            "relocate",
        ];

        const createChannel = [
            "create a channel",
            "set up a channel",
            "i want to create a channel",
            "please create a channel",
            "can you create a channel",
            "channel",
            "new channel",
            "create",
            "make a channel",
        ];

        const hasCreateChannelKeyword = createChannel.filter((keyword) =>
            message.toLowerCase().includes(keyword)
        );
        const hasCreateChannelIntent = hasCreateChannelKeyword.length >= 2;

        const hasLocationKeyword = locationKeywords.filter((keyword) =>
            message.toLowerCase().includes(keyword)
        );
        const hasLocationIntent = hasLocationKeyword.length >= 2;

        let systemPrompt = `You are a helpful assistant. The user is currently at ${location}.`;

        switch (true) {
            case hasLocationIntent:
                systemPrompt = CHANGE_LOCATION_PROMPT;
                break;

            case hasCreateChannelIntent:
                systemPrompt = CREATE_CHANNEL_PROMPT;
                break;
            default:
                systemPrompt = `You are a helpful assistant. The user is currently at ${location}.`;
                break;
        }

        return {
            model: modelType,
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Message: ${message}`,
                        },
                    ],
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
