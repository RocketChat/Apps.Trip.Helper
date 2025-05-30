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
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";
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
import {
    VALIDATION_PROMPT,
    CONFIRMATION_PROMPT,
} from "./src/const/prompts";
import { UserHandler } from "./src/handlers/UserHandler";

import { settings } from "./src/config/settings";
import { ElementBuilder } from "./src/lib/ElementBuilder";

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
            message.sender
        );

        this.getLogger().info(
            `Message sent by user ${message.sender.username}: ${message.text}`
        );
        if (
            !message.file ||
            !message.file._id ||
            !message.file.type.startsWith("image/")
        ) {
            this.getLogger().info("No image file found in the message.");
            return;
        }
        const appUser = await this.getAccessors()
            .reader.getUserReader()
            .getAppUser(this.getID());

        const imageProcessor = new ImageHandler(http, read);
        notifyMessage(
            message.room,
            read,
            message.sender,
            "Processing your image, please wait...",
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
                "Image is valid. Processing...",
                message.threadId
            );
            const response = await imageProcessor.processImage(
                message,
                CONFIRMATION_PROMPT
            );
            const parsedResponse = JSON.parse(response);
            if(parsedResponse.name != "unknown"){
                userHandler.confirmLocation(`Your image contains a recognizable location: ${parsedResponse.name}`);
            }else{
                userHandler.noLocationDetected();
            }
        } else {
            this.getLogger().info("Image validation failed.");
            notifyMessage(
                message.room,
                read,
                message.sender,
                "The uploaded file is not a valid image. Please try again with a different image.",
                message.threadId
            );
            return;
        }
    }
}
