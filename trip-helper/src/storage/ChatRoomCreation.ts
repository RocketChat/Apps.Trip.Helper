import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import {
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";

export async function ChatRoomCreation(
    read: IRead,
    sender: IUser,
    room: IRoom,
    persis: IPersistence,
    name: string
): Promise<boolean> {
    const assoc = new RocketChatAssociationRecord(
        RocketChatAssociationModel.ROOM,
        `channelrequest${sender.id}`
    );
    await persis.updateByAssociation(
        assoc,
        {
            channelName: name,
        },
        true
    );
    return true;
}
