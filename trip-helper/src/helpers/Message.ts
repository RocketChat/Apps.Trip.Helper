import { IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { CreateDirectRoom } from "./CreateDirectRoom";
import { BlockBuilder } from "../lib/BlockBuilder";
import { OnInstallContent } from "../enum/messages";
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
    const title = [OnInstallContent.PREVIEW_TITLE.toString()];
    const description = [OnInstallContent.PREVIEW_DESCRIPTION.toString()];
    const contextElements = [OnInstallContent.PREVIEW_CONTEXT.toString()];
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
    const text = `Hey **${
        user.username
    }** 👋, I am your Trip Helper! \n ${OnInstallContent.Welcome_Message.toString()}`;

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
