import { IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { Settings } from "../config/settings";
import { getUserLanguage, resolveLanguage, Language } from "../translation/translation";

export async function getResponseLanguage(
    read: IRead,
    user?: { language?: string | null; settings?: { preferences?: { language?: string | null } } } | null
): Promise<Language> {
    try {
        const envReader = read.getEnvironmentReader().getSettings();
        const configured = await envReader.getValueById(Settings.RESPONSE_LANGUAGE);
        if (typeof configured === "string" && configured) {
            return resolveLanguage(configured);
        }
    } catch {
        // ignore and fall back
    }

    return getUserLanguage(user ?? null);
}
