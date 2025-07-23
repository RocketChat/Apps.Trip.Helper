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

export async function storeLocationEvents(
    read: IRead,
    sender: IUser,
    room: IRoom,
    persis: IPersistence,
    eventResponse: any[]
): Promise<boolean> {
    const assoc = new RocketChatAssociationRecord(
        RocketChatAssociationModel.ROOM,
        `${room.id}/events`
    );
    await persis.updateByAssociation(
        assoc,
        {
            eventResponse: eventResponse,
        },
        true
    );
    return true;
}
