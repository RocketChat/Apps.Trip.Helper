import {
    IPreference,
    AIProviderEnum,
} from "../definition/helper/userPreference";
import { IuserPreferenceStorage } from "../definition/storage/IuserPreferenceStorage";
import {
    IPersistence,
    IPersistenceRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";

export class UserPreferenceStorage implements IuserPreferenceStorage {
    private userId: string;
    constructor(
        private readonly persistence: IPersistence,
        private readonly persistenceRead: IPersistenceRead,
        userId: string
    ) {
        this.userId = userId;
    }

    public async storeUserPreference(preference: IPreference): Promise<void> {
        const currentPreference: IPreference = await this.getUserPreference();

        const updatedPreference: IPreference = {
            userId: this.userId,
            AIconfiguration: {
                AIProvider:
                    preference.AIconfiguration.AIProvider ||
                    currentPreference.AIconfiguration.AIProvider,
                Llama3_2: {
                    apiKey:
                        preference.AIconfiguration.Llama3_2.apiKey ||
                        currentPreference.AIconfiguration.Llama3_2.apiKey,
                    endpoint:
                        preference.AIconfiguration.Llama3_2.endpoint ||
                        currentPreference.AIconfiguration.Llama3_2.endpoint,
                },
                Llama3_3: {
                    apiKey:
                        preference.AIconfiguration.Llama3_3.apiKey ||
                        currentPreference.AIconfiguration.Llama3_3.apiKey,
                    endpoint:
                        preference.AIconfiguration.Llama3_3.endpoint ||
                        currentPreference.AIconfiguration.Llama3_3.endpoint,
                },
            },
        };

        const association = new RocketChatAssociationRecord(
            RocketChatAssociationModel.USER,
            `${this.userId}#preference`
        );
        await this.persistence.updateByAssociation(
            association,
            { preference: updatedPreference },
            true
        );
    }

    public async getUserPreference(): Promise<IPreference> {
        const association = new RocketChatAssociationRecord(
            RocketChatAssociationModel.USER,
            `${this.userId}#preference`
        );
        const result = (await this.persistenceRead.readByAssociation(
            association
        )) as Array<{ preference: IPreference }>;
        if (result.length > 0) {
            return result[0].preference;
        } else {
            const preference: IPreference = {
                userId: this.userId,
                AIconfiguration: {
                    AIProvider: AIProviderEnum.Llama3_2,
                    Llama3_2: {
                        apiKey: "",
                        endpoint: "",
                    },
                    Llama3_3: {
                        apiKey: "",
                        endpoint: "",
                    },
                },
            };
            return preference;
        }
    }
    public async clearUserPreference(): Promise<void> {
        const association = new RocketChatAssociationRecord(
            RocketChatAssociationModel.USER,
            `${this.userId}#preference`
        );
        await this.persistence.removeByAssociation(association);
    }
}
