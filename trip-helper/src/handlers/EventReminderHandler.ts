import { IHttp, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { getAPIConfig } from "../config/settings";
import {
    EVENTS_DATES_PROMPT,
    EVENTS_REMINDER_PROMPT,
} from "../const/prompts";

export class EventReminderHandler {
    constructor(private readonly http: IHttp, private readonly read: IRead) {}

    public async sendEventDetails(
        eventResponse: string,
        currentDate: string
    ): Promise<any> {
        const { apiKey, modelType, apiEndpoint } = await getAPIConfig(
            this.read
        );
        if (!apiKey || !modelType || !apiEndpoint) {
            return "API configuration is missing. Please contact the admin.";
        }
        const requestBody = await this.createMessageRequest(
            eventResponse,
            currentDate,
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
            return `Failed to send eventResponse: ${error.eventResponse}`;
        }
    }
    private async createMessageRequest(
        eventResponse: string,
        currentDate: string,
        modelType: string
    ) {
        return {
            model: modelType,
            messages: [
                {
                    role: "system",
                    content: EVENTS_REMINDER_PROMPT,
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: EVENTS_DATES_PROMPT.replace(
                                "[PASTE THE INPUT TEXT HERE]",
                                eventResponse
                            ).replace(
                                "{currentDate}",
                                currentDate
                            ),
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
