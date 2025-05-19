import { IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom, RoomType } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";

export async function CreateDirectRoom(
    read: IRead,
    modify: IModify,
    usernames: Array<string>
): Promise<IRoom> {
    let room: IRoom | undefined = await read
        .getRoomReader()
        .getDirectByUsernames(usernames);

    if (room) {
        return room;
    }

    const creator = (await read.getUserReader().getAppUser()) as IUser;

    const newRoom = modify
        .getCreator()
        .startRoom()
        .setType(RoomType.DIRECT_MESSAGE)
        .setCreator(creator)
        .setMembersToBeAddedByUsernames(usernames);

    const roomId = await modify.getCreator().finish(newRoom);
    return (await read.getRoomReader().getById(roomId)) as IRoom;
}
