import { IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom, RoomType } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";

export async function CreatePrivateGroup(
    read: IRead,
    modify: IModify,
    usernames: Array<string>,
    name: string
): Promise<IRoom> {
    let room: IRoom | undefined = await read.getRoomReader().getByName(`asktrip- ${name}`);

    if (room) {
        return room;
    }
    const creator = (await read.getUserReader().getAppUser()) as IUser;

    if (!name) {
        name = usernames.join(", ");
    }

    const newRoom = modify
        .getCreator()
        .startRoom()
        .setType(RoomType.PRIVATE_GROUP)
        .setCreator(creator)
        .setMembersToBeAddedByUsernames(usernames)  
        .setSlugifiedName(`asktrip${name}`)
        .setDisplayName(`asktrip${name}`);

    const roomId = await modify.getCreator().finish(newRoom);
    return (await read.getRoomReader().getById(roomId)) as IRoom;
}
