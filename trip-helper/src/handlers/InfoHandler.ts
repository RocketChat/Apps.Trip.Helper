import { IHttp, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { getAPIConfig } from "../config/settings";
import {
    INFORMATION_CONTENT_PROMPT,
    INFORMATION_PROMPT,
} from "../const/prompts";

export class InfoHandler {
    constructor(private readonly http: IHttp, private readonly read: IRead) {}

    public async sendInfo(
        HTMLResponse: any[],
        location: string
    ): Promise<string> {
        const { apiKey, modelType, apiEndpoint } = await getAPIConfig(
            this.read
        );
        if (!apiKey || !modelType || !apiEndpoint) {
            return "API configuration is missing. Please contact the admin.";
        }
        const requestBody = await this.createMessageRequest(
            HTMLResponse,
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
            return `Failed to send HTMLResponse: ${error.HTMLResponse}`;
        }
    }
    private async createMessageRequest(
        HTMLResponse: any[],
        location: string,
        modelType: string
    ) {
        return {
            model: modelType,
            messages: [
                {
                    role: "system",
                    content: INFORMATION_PROMPT,
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: INFORMATION_CONTENT_PROMPT.replace(
                                "{location}",
                                location
                            ),
                        },
                        {
                            type: "text",
                            text: JSON.stringify(HTMLResponse),
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
