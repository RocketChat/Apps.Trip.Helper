import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import {
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { notifyMessage } from "../helpers/Message";
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
        `${room.id}/${room.slugifiedName}/events`
    );
    await persis.updateByAssociation(
        assoc,
        {
            eventResponse: eventResponse,
        },
        true
    );
    // notifyMessage(
    //     room,
    //     read,
    //     sender,
    //     `your event details ${eventResponse}. You can now ask for trip-related information!`
    // );
    return true;
}
