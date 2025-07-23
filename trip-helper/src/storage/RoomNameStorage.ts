import {
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { notifyMessage } from "../helpers/Message";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";

export async function storeRoomName(
    room: IRoom,
    read: IRead,
    sender: IUser,
    persis: IPersistence,
    roomName: string
): Promise<boolean> {
    const assoc = new RocketChatAssociationRecord(
        RocketChatAssociationModel.USER,
        sender.id
    );

    const existingData = (await read
        .getPersistenceReader()
        .readByAssociation(assoc)) as Array<{ tripRooms: string[] }>;
    const roomList = existingData?.[0]?.tripRooms || [];
    if (!roomList.includes(`asktrip- ${roomName}`)) {
        roomList.push(`asktrip- ${roomName}`);
    } else {
        notifyMessage(
            room,
            read,
            sender,
            `Room name '${roomName}' already exists. Please choose a different name.`
        );
        return false;
    }

    await persis.updateByAssociation(
        assoc,
        {
            tripRooms: roomList,
        },
        true
    );
    return true;
}
