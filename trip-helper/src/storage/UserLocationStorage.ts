import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import {
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { notifyMessage } from "../helpers/Message";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";

export async function storeUserLocation(
    read: IRead,
    sender: IUser,
    room: IRoom,
    persis: IPersistence,
    location: string
): Promise<boolean> {
    const assoc = new RocketChatAssociationRecord(
        RocketChatAssociationModel.ROOM,
        `${room.id}/${room.slugifiedName}`
    );
    await persis.updateByAssociation(
        assoc,
        {
            userLocation: location,
        },
        true
    );
    return true; 
}