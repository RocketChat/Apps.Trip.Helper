import { IRead, IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { TripHelperApp } from "../../TripHelperApp";
import { t } from "../translation/translation";
import { getResponseLanguage } from "./Language";

export async function sendHelperMessage(
    read: IRead,
    modify: IModify,
    room: IRoom,
    sender: IUser
) {
    const appUser = (await read.getUserReader().getAppUser()) as IUser;
    const language = await getResponseLanguage(read, sender);
    const message = t("Helper_Message", language, {
        name: sender.name || sender.username,
    });

    const helperMessage = modify
        .getCreator()
        .startMessage()
        .setRoom(room)
        .setSender(appUser)
        .setText(message)
        .setGroupable(false);

    return read.getNotifier().notifyUser(sender, helperMessage.getMessage());
}

export async function sendSetReminder_1(
    app: TripHelperApp,
    read: IRead,
    modify: IModify,
    room: IRoom,
    sender: IUser,
    message: string
): Promise<void> {
    const appUser = (await read.getUserReader().getAppUser()) as IUser;
    const { elementBuilder, blockBuilder } = app.getUtils();
    const language = await getResponseLanguage(read, sender);
    const text = blockBuilder.createSectionBlock({
        text: message,
    });

    const sendSetReminder = elementBuilder.addButton(
        {
            text: t("Button_Set_Reminder", language),
            style: "primary",
        },
        {
            blockId: "Set_Reminder_Block_1",
            actionId: "Set_Reminder_Action_1",
        }
    );

    const buttonAction = blockBuilder.createActionBlock({
        elements: [sendSetReminder],
    });
    const blocks = [text, buttonAction];
    const helperMessage = modify
        .getCreator()
        .startMessage()
        .setRoom(room)
        .setSender(appUser)
        .setGroupable(false)
        .setBlocks(blocks);

    return read.getNotifier().notifyUser(sender, helperMessage.getMessage());
}

export async function sendSetReminder_2(
    app: TripHelperApp,
    read: IRead,
    modify: IModify,
    room: IRoom,
    sender: IUser,
    message: string
): Promise<void> {
    const appUser = (await read.getUserReader().getAppUser()) as IUser;
    const { elementBuilder, blockBuilder } = app.getUtils();
    const language = await getResponseLanguage(read, sender);
    const text = blockBuilder.createSectionBlock({
        text: message,
    });

    const sendSetReminder = elementBuilder.addButton(
        {
            text: t("Button_Set_Reminder", language),
            style: "primary",
        },
        {
            blockId: "Set_Reminder_Block_2",
            actionId: "Set_Reminder_Action_2",
        }
    );

    const buttonAction = blockBuilder.createActionBlock({
        elements: [sendSetReminder],
    });
    const blocks = [text, buttonAction];
    const helperMessage = modify
        .getCreator()
        .startMessage()
        .setRoom(room)
        .setSender(appUser)
        .setGroupable(false)
        .setBlocks(blocks);

    return read.getNotifier().notifyUser(sender, helperMessage.getMessage());
}

export async function sendSetReminder_3(
    app: TripHelperApp,
    read: IRead,
    modify: IModify,
    room: IRoom,
    sender: IUser,
    message: string
): Promise<void> {
    const appUser = (await read.getUserReader().getAppUser()) as IUser;
    const { elementBuilder, blockBuilder } = app.getUtils();
    const language = await getResponseLanguage(read, sender);
    const text = blockBuilder.createSectionBlock({
        text: message,
    });

    const sendSetReminder = elementBuilder.addButton(
        {
            text: t("Button_Set_Reminder", language),
            style: "primary",
        },
        {
            blockId: "Set_Reminder_Block_3",
            actionId: "Set_Reminder_Action_3",
        }
    );

    const buttonAction = blockBuilder.createActionBlock({
        elements: [sendSetReminder],
    });
    const blocks = [text, buttonAction];
    const helperMessage = modify
        .getCreator()
        .startMessage()
        .setRoom(room)
        .setSender(appUser)
        .setGroupable(false)
        .setBlocks(blocks);

    return read.getNotifier().notifyUser(sender, helperMessage.getMessage());
}

export async function sendConfirmationMessage(
    app: TripHelperApp,
    read: IRead,
    modify: IModify,
    room: IRoom,
    sender: IUser,
    message: string
): Promise<void> {
    const appUser = (await read.getUserReader().getAppUser()) as IUser;
    const { elementBuilder, blockBuilder } = app.getUtils();
    const language = await getResponseLanguage(read, sender);
    const text = blockBuilder.createSectionBlock({
        text: `*${message}*`,
    });

    const confirmationButton = elementBuilder.addButton(
        {
            text: t("Button_Yes", language),
            style: "primary",
        },
        {
            blockId: "Yes_Location_Confirmation",
            actionId: "Location_Accept",
        }
    );

    const neglectButton = elementBuilder.addButton(
        {
            text: t("Button_No", language),
            style: "danger",
        },
        {
            blockId: "No_Location_Confirmation",
            actionId: "Location_Neglect",
        }
    );

    const buttonAction = blockBuilder.createActionBlock({
        elements: [confirmationButton, neglectButton],
    });
    const blocks = [text, buttonAction];
    const helperMessage = modify
        .getCreator()
        .startMessage()
        .setRoom(room)
        .setSender(appUser)
        .setGroupable(false)
        .setBlocks(blocks);

    return read.getNotifier().notifyUser(sender, helperMessage.getMessage());
}

export async function sendGetLocationMessage(
    app: TripHelperApp,
    read: IRead,
    modify: IModify,
    room: IRoom,
    sender: IUser,
    message: string
): Promise<void> {
    const appUser = (await read.getUserReader().getAppUser()) as IUser;
    const { elementBuilder, blockBuilder } = app.getUtils();
    const language = await getResponseLanguage(read, sender);
    const text = blockBuilder.createSectionBlock({
        text: `${message}`,
    });
    const locationButton = elementBuilder.addButton(
        {
            text: t("Share_Location", language),
            style: "primary",
        },
        {
            blockId: "Location_Request_Block",
            actionId: "Location_Request_Action",
        }
    );
    const neglectLocationButton = elementBuilder.addButton(
        {
            text: t("Not_Now", language),
            style: "danger",
        },
        {
            blockId: "Neglect_Location_Block",
            actionId: "Neglect_Location_Action",
        }
    );
    const buttonAction = blockBuilder.createActionBlock({
        elements: [locationButton, neglectLocationButton],
    });
    const blocks = [text, buttonAction];
    const helperMessage = modify
        .getCreator()
        .startMessage()
        .setRoom(room)
        .setSender(appUser)
        .setGroupable(false)
        .setBlocks(blocks);
    return read.getNotifier().notifyUser(sender, helperMessage.getMessage());
}

export async function sendDefaultNotification(
    app: TripHelperApp,
    read: IRead,
    modify: IModify,
    user: IUser,
    room: IRoom
): Promise<void> {
    const appUser = (await read.getUserReader().getAppUser()) as IUser;
    const { elementBuilder, blockBuilder } = app.getUtils();
    const language = await getResponseLanguage(read, user);

    const text = blockBuilder.createSectionBlock({
        text: t("Default_Welcome", language, {
            name: user.name || user.username,
        }),
    });

    const changeLocationButtonElement = elementBuilder.addButton(
        { text: t("Button_Show_Location", language), style: "primary" },
        {
            blockId: "Show_Location_Block",
            actionId: "Show_Location_Action",
        }
    );

    const setReminderButtonElement = elementBuilder.addButton(
        { text: t("Button_Set_Reminder", language), style: "primary" },
        {
            blockId: "Set_Reminder_Getting_Started_Block",
            actionId: "Set_Reminder_Getting_Started_Action",
        }
    );

    const showInfoButtonElement = elementBuilder.addButton(
        { text: t("Button_Show_Info", language), style: "secondary" },
        {
            blockId: "Show_Info_Block",
            actionId: "Show_Info_Action",
        }
    );

    const needMoreButtonElement = elementBuilder.addButton(
        { text: t("Button_Need_More", language), style: "secondary" },
        {
            blockId: "Need_More_Block",
            actionId: "Need_More_Action",
        }
    );

    const buttonAction = blockBuilder.createActionBlock({
        elements: [
            changeLocationButtonElement,
            setReminderButtonElement,
            showInfoButtonElement,
            needMoreButtonElement,
        ],
    });

    const blocks = [text, buttonAction];

    const helperMessage = modify
        .getCreator()
        .startMessage()
        .setRoom(room)
        .setSender(appUser)
        .setGroupable(false)
        .setBlocks(blocks);

    return read.getNotifier().notifyUser(user, helperMessage.getMessage());
}
