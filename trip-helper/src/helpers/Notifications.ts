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
        • use \`/trip create\` to create a separate trip channel`;

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

export async function getUserLocationIP(
    http: IHttp,
    read: IRead,
    room: IRoom,
    sender: IUser
): Promise<{ latitude: number; longitude: number } | null> {
    const res = await http.get("https://ipinfo.io/json");
    const data = res.data;
    if (data && data.loc) {
        const [latitude, longitude] = data.loc.split(",");
        return {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
        };
    }
    notifyMessage(
        room,
        read,
        sender,
        "**Unable to retrieve location** from IP address."
    );
    return null;
}

export async function getUserAddressThroughIP(
    response: { latitude: number; longitude: number },
    http: IHttp,
    read: IRead,
    room: IRoom,
    sender: IUser
): Promise<string | null> {
    const addressResponse = await http.get(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${response.latitude}&lon=${response.longitude}&zoom=14&addressdetails=1`
    );
    notifyMessage(
        room,
        read,
        sender,
        `Your Location: ${addressResponse.data.display_name}`
    );
    return addressResponse.data.display_name;
}
