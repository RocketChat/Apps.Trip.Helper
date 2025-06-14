import {
    IAppAccessors,
    IAppInstallationContext,
    IConfigurationExtend,
    IEnvironmentRead,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import {
    IAppInfo,
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";
import { TripCommand } from "./src/commands/TripCommand";
import {
    notifyMessage,
    sendHelperMessageOnInstall,
} from "./src/helpers/Message";
import { BlockBuilder } from "./src/lib/BlockBuilder";
import {
    IMessage,
    IPostMessageSent,
} from "@rocket.chat/apps-engine/definition/messages";
import { ImageHandler } from "./src/handlers/ImageHandler";
import { VALIDATION_PROMPT, CONFIRMATION_PROMPT } from "./src/const/prompts";
import { UserHandler } from "./src/handlers/UserHandler";

import { settings } from "./src/config/settings";
import { ElementBuilder } from "./src/lib/ElementBuilder";
import {
    IUIKitResponse,
    UIKitBlockInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { ExecuteBlockActionHandler } from "./src/handlers/ExecuteBlockActionHandler";
import { MessageHandler } from "./src/handlers/MessageHandler";

export class TripHelperApp extends App implements IPostMessageSent {
    private blockBuilder: BlockBuilder;
    private elementBuilder: ElementBuilder;
    private readonly appLogger: ILogger;

    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
        this.appLogger = this.getLogger();
    }

    public async initialize(
        configurationExtend: IConfigurationExtend,
        environmentRead: IEnvironmentRead
    ): Promise<void> {
        await configurationExtend.slashCommands.provideSlashCommand(
            new TripCommand(this)
        );
        this.blockBuilder = new BlockBuilder(this.getID());
        this.elementBuilder = new ElementBuilder(this.getID());

        await Promise.all(
            settings.map((setting) =>
                configurationExtend.settings.provideSetting(setting)
            )
        );
    }

    public getUtils(): any {
        return {
            elementBuilder: this.elementBuilder,
            blockBuilder: this.blockBuilder,
        };
    }

    public async onInstall(
        context: IAppInstallationContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<void> {
        const { user } = context;
        await sendHelperMessageOnInstall(this.getID(), user, read, modify);
        return;
    }

    public async executeBlockActionHandler(
        context: UIKitBlockInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<IUIKitResponse> {
        const executeBlockActionHandler = new ExecuteBlockActionHandler(
            this,
            read,
            http,
            persistence,
            modify,
            context
        );
        return await executeBlockActionHandler.handleActions();
    }

    public async checkPostMessageSent(
        message: IMessage,
        read: IRead,
        http: IHttp
    ): Promise<boolean> {
        const assoc = new RocketChatAssociationRecord(
            RocketChatAssociationModel.USER,
            message.sender.id
        );

        const data = (await read
            .getPersistenceReader()
            .readByAssociation(assoc)) as Array<{ tripRooms: string[] }>;

        if (!data?.[0]?.tripRooms?.length) {
            return false;
        }
        const targetRooms = data[0].tripRooms;
        return targetRooms.includes(message.room.slugifiedName);
    }

    public async executePostMessageSent(
        message: IMessage,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<void> {
        const userHandler = new UserHandler(
            this,
            read,
            modify,
            message.room,
            message.sender,
            http,
            persistence
        );
        const imageProcessor = new ImageHandler(http, read);

        this.getLogger().info(
            `Message sent by user ${message.sender.username}: ${message.text}`
        );
        if (
            message.file &&
            message.file._id &&
            message.file.type.startsWith("image/")
        ) {
            const appUser = await this.getAccessors()
                .reader.getUserReader()
                .getAppUser(this.getID());

            notifyMessage(
                message.room,
                read,
                message.sender,
                "Processing your image, please wait for a moment ...",
                message.threadId
            );
            const isImage = await imageProcessor.validateImage(
                message,
                VALIDATION_PROMPT
            );
            if (isImage) {
                this.getLogger().info("Image validation successful.");
                notifyMessage(
                    message.room,
                    read,
                    message.sender,
                    "Valid Image received. Processing your location ...",
                    message.threadId
                );
                const response = await imageProcessor.processImage(
                    message,
                    CONFIRMATION_PROMPT
                );
                if (response.includes("Failed to process your image:")) {
                    notifyMessage(
                        message.room,
                        read,
                        message.sender,
                        response,
                        message.threadId
                    );
                    return;
                }
                const parsedResponse = JSON.parse(response);
                if (parsedResponse?.name && parsedResponse.name !== "unknown") {
                    await userHandler.confirmLocation(parsedResponse.name);
                } else {
                    await userHandler.noLocationDetected();
                }
            } else {
                this.getLogger().info("Image validation failed.");
                notifyMessage(
                    message.room,
                    read,
                    message.sender,
                    "The uploaded image is not valid. Please try again with a different image.",
                    message.threadId
                );
                return;
            }
        }
        // 32° 18' 23.1" N 122° 36' 52.5" W
        // 29.3875, 76.9682
        else if (
            message.text?.match(
                /^\d{1,3}°\s\d{1,2}'\s\d{1,2}\.\d{1,2}"\s[NSEW]\s\d{1,3}°\s\d{1,2}'\s\d{1,2}\.\d{1,2}"\s[NSEW]$/
            ) ||
            message.text?.match(/^-?\d{1,3}\.\d{1,6},\s-?\d{1,3}\.\d{1,6}$/)
        ) {
            notifyMessage(
                message.room,
                read,
                message.sender,
                "Location detected"
            );
        } else if (
            typeof message.text === "string" &&
            message.text.trim().length > 0
        ) {
            const messageHandler = new MessageHandler(http, read);

            const assoc = new RocketChatAssociationRecord(
                RocketChatAssociationModel.ROOM,
                `${message.room.id}/${message.room.slugifiedName}`
            );
            const userLocation = (
                await read.getPersistenceReader().readByAssociation(assoc)
            )[0] as { userLocation?: string } | undefined;
            const locationValue = userLocation?.userLocation;

            if (!locationValue) {
                notifyMessage(
                    message.room,
                    read,
                    message.sender,
                    "Please provide a valid location first."
                );
                return;
            }
            notifyMessage(
                message.room,
                read,
                message.sender,
                `${message.sender.username}, your location is set to: ${locationValue}. ${message.text}`
            );
            const response = await messageHandler.sendMessage(
                message.text,
                locationValue
            );

            notifyMessage(
                message.room,
                read,
                message.sender,
                response,
                message.threadId
            );
        }
    }
}
