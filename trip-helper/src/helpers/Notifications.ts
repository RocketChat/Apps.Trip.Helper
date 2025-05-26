import { IRead, IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { TripHelperApp } from "../../TripHelperApp";

export async function sendHelperMessage(
    read: IRead,
    modify: IModify,
    room: IRoom,
    sender: IUser
) {
    const appUser = (await read.getUserReader().getAppUser()) as IUser;
    const message = `Hi ${sender.name} 👋, I am your Trip Helper!`;

    const helperMessage = modify
        .getCreator()
        .startMessage()
        .setRoom(room)
        .setSender(appUser)
        .setText(message)
        .setGroupable(false);

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
    sender: IUser
): Promise<void> {
    const appUser = (await read.getUserReader().getAppUser()) as IUser;
    const { elementBuilder, blockBuilder } = app.getUtils();
    const text = blockBuilder.createSectionBlock({
        text: "Please share your location to get the best trip suggestions.",
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
}
