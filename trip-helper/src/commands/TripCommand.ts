import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import { TripHelperApp } from "../../TripHelperApp";
import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { CommandUtility } from "./CommandUtility";
import { ICommandUtilityParams } from "../definition/command/ICommandUtility";

export class TripCommand implements ISlashCommand {
    public command: string = "trip";
    public i18nParamsExample: string = "tripCommandParams";
    public i18nDescription: string = "Type /trip help for more information";
    public providesPreview: boolean = false;

    constructor(private readonly app: TripHelperApp) {}

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<void> {
        const params = context.getArguments();
        const sender = context.getSender();
        const room = context.getRoom();
        const triggerId = context.getTriggerId();
        const threadId = context.getThreadId();

        const commandUtilityParams: ICommandUtilityParams = {
            params,
            sender,
            room,
            triggerId,
            threadId,
            read,
            modify,
            http,
            persis,
            app: this.app,
        };

        const commandUtility = new CommandUtility(commandUtilityParams);
        await commandUtility.resolveCommand();
    }
}
