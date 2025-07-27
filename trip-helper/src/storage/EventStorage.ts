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
import { LocationEvent } from "../definition/handlers/EventHandler";

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

export async function getStoredLocationEvents(
    read: IRead,
    room: IRoom
): Promise<LocationEvent[]> {
    const assoc = new RocketChatAssociationRecord(
        RocketChatAssociationModel.ROOM,
        `${room.id}/events`
    );
    
    const result = await read.getPersistenceReader().readByAssociation(assoc);
    
    if (result && result.length > 0) {
        const data = result[0] as any;
        if (data && data.eventResponse) {
            return data.eventResponse;
        }
    }
    
    return [];
}
