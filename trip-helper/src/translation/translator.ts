import {
    IHttp,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    Language,
    resolveLanguage,
    t,
    TranslationKey,
    TranslationParams,
} from "./translation";

export async function tAsync(
    key: TranslationKey,
    language: string | Language,
    _read: IRead,
    _http?: IHttp,
    _persis?: IPersistence,
    params?: TranslationParams
): Promise<string> {
    const resolved =
        typeof language === "string" ? resolveLanguage(language) : language;
    return t(key, resolved, params);
}
