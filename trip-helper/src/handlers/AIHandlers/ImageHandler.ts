import { IRead, IHttp } from "@rocket.chat/apps-engine/definition/accessors";
import { IMessage } from "@rocket.chat/apps-engine/definition/messages";
import { getAPIConfig } from "../../config/settings";
import { MODEL_CONTENT } from "../../const/prompts";

export class ImageHandler {
    constructor(private readonly http: IHttp, private readonly read: IRead) {}

    public async validateImage(
        message: IMessage,
        prompt: string
    ): Promise<boolean> {
        try {
            const response = await this.processImage(message, prompt);
            const parsedResponse = JSON.parse(response);
            return parsedResponse.isLandmark === "true";
        } catch (error) {
            return false;
        }
    }

    public async processImage(
        message: IMessage,
        prompt: string
    ): Promise<string> {
        const { apiKey, modelType, apiEndpoint } = await getAPIConfig(
            this.read
        );
        if (!apiKey || !modelType || !apiEndpoint) {
            return "API configuration is missing. Please contact the admin.";
        }
        const base64Image = await this.convertImageToBase64(message);
        try {
            const requestBody = this.createOCRRequest(
                modelType,
                prompt,
                base64Image
            );
            return await this.sendRequest(apiEndpoint, apiKey, requestBody);
        } catch (error) {
            return `Failed to process your image: ${error.message}, Contact the admin.`;
        }
    }

    private async convertImageToBase64(message: IMessage): Promise<string> {
        try {
            const fileId = message.file?._id;
            const image = await this.read
                .getUploadReader()
                .getBufferById(fileId!);
            return image.toString("base64");
        } catch (error) {
            throw error;
        }
    }

    private createOCRRequest(
        modelType: string,
        prompt: string,
        base64Image: string
    ) {
        return {
            model: modelType,
            messages: [
                {
                    role: "system",
                    content: MODEL_CONTENT,
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt,
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                            },
                        },
                    ],
                },
            ],
        };
    }

    private async sendRequest(
        apiEndpoint: string,
        apiKey: string,
        requestBody: any
    ) {
        const response = await this.http.post(apiEndpoint, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            data: requestBody,
        });

        if (response.statusCode !== 200) {
            throw new Error(`API error: ${response.statusCode}`);
        }

        return response.data.choices[0].message.content;
    }
}
