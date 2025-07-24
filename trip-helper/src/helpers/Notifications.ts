import {
    IRead,
    IModify,
    IHttp,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { TripHelperApp } from "../../TripHelperApp";
import { notifyMessage } from "./Message";

export async function sendHelperMessage(
    read: IRead,
    modify: IModify,
    room: IRoom,
    sender: IUser
) {
    const appUser = (await read.getUserReader().getAppUser()) as IUser;
    const message = `Hi ${sender.name} 👋, I am your Trip Helper!
        • use \`/trip help\` to get help   
        • use \`/trip create\` to create a separate trip channel
        • use \`/trip reminder\` to set a reminder for your trip
        • use \`/trip location\` to share your location with the trip channel;
        • use \`/trip info\` to get information about your current location`;

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
    const text = blockBuilder.createSectionBlock({
        text: message,
    });

    const sendSetReminder = elementBuilder.addButton(
        {
            text: "Set Reminder-1",
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
    const text = blockBuilder.createSectionBlock({
        text: message,
    });

    const sendSetReminder = elementBuilder.addButton(
        {
            text: "Set Reminder-2",
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
    const text = blockBuilder.createSectionBlock({
        text: message,
    });

    const sendSetReminder = elementBuilder.addButton(
        {
            text: "Set Reminder-3",
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
    const text = blockBuilder.createSectionBlock({
        text: `*${message}*`,
    });

    const confirmationButton = elementBuilder.addButton(
        {
            text: "Yes",
            style: "primary",
        },
        {
            blockId: "Yes_Location_Confirmation",
            actionId: "Location_Accept",
        }
    );

    const neglectButton = elementBuilder.addButton(
        {
            text: "No",
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
    const text = blockBuilder.createSectionBlock({
        text: `${message}`,
    });
    const locationButton = elementBuilder.addButton(
        {
            text: "Share Location",
            style: "primary",
        },
        {
            blockId: "Location_Request_Block",
            actionId: "Location_Request_Action",
        }
    );
    const neglectLocationButton = elementBuilder.addButton(
        {
            text: "Not Now",
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
