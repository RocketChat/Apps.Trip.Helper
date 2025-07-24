import {
    IRead,
    IModify,
    IHttp,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { notifyMessage } from "../helpers/Message";

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
