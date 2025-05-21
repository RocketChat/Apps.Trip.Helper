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
import { sendHelperMessageOnInstall } from "./src/helpers/Message";
import { BlockBuilder } from "./src/lib/BlockBuilder";
import { settings } from "./src/config/settings";
import { ElementBuilder } from "./src/lib/ElementBuilder";

export class TripHelperApp extends App {
    private blockBuilder: BlockBuilder;
    private elementBuilder: ElementBuilder
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
        ));
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
}
