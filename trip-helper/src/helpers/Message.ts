import { IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { CreateDirectRoom } from "./CreateDirectRoom";
import { BlockBuilder } from "../lib/BlockBuilder";
import { OnInstallContent } from "../enum/messages";
import { t } from "../translation/translation";
import { getResponseLanguage } from "./Language";

export async function sendMessage(
    modify: IModify,
    sender: IUser,
    room: IRoom,
    message: string
): Promise<void> {
    const messageBuilder = modify
        .getCreator()
        .startMessage()
        .setSender(sender)
        .setRoom(room)
        .setGroupable(false)
        .setParseUrls(true);

    if (message) {
        messageBuilder.setText(message);
    }

    await modify.getCreator().finish(messageBuilder);
    return;
}

export async function sendHelperMessageOnInstall(
    appId: string,
    user: IUser,
    read: IRead,
    modify: IModify
): Promise<void> {
    const appUser = (await read.getUserReader().getAppUser()) as IUser;
    const members = [user.username, appUser.username];

    const room = await CreateDirectRoom(read, modify, members);
    const blockBuilder = new BlockBuilder(appId);
    const language = await getResponseLanguage(read, user);
    const title = [t("Install_Preview_Title", language)];
    const description = [t("Install_Preview_Description", language)];
    const contextElements = [t("Install_Preview_Context", language)];
    const footer = blockBuilder.createContextBlock({
        contextElements: contextElements,
    });
    const thumb = {
        url: OnInstallContent.PREVIEW_IMAGE.toString(),
    };

    const installationPreview = blockBuilder.createPreviewBlock({
        title,
        description,
        footer,
        thumb,
    });
    const text = t("Welcome_User", language, {
        username: user.username,
        welcomeMessage: t("Install_Welcome_Message", language),
    });

    const previewBuilder = modify
        .getCreator()
        .startMessage()
        .setRoom(room)
        .setSender(appUser)
        .setGroupable(false)
        .setBlocks([installationPreview])
        .setParseUrls(true);

    const textMessageBuilder = modify
        .getCreator()
        .startMessage()
        .setRoom(room)
        .setSender(appUser)
        .setGroupable(true)
        .setParseUrls(false)
        .setText(text);

    await modify.getCreator().finish(previewBuilder);
    await modify.getCreator().finish(textMessageBuilder);
}

export async function notifyMessage(
    room: IRoom,
    read: IRead,
    user: IUser,
    message: string,
    threadId?: string
): Promise<void> {
    const notifier = read.getNotifier();

    const messageBuilder = notifier.getMessageBuilder();
    messageBuilder.setText(message);
    messageBuilder.setRoom(room);

    if (threadId) {
        messageBuilder.setThreadId(threadId);
    }

    return notifier.notifyUser(user, messageBuilder.getMessage());
}
