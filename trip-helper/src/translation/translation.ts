import { en } from "./locales/en";
import { de } from "./locales/de";
import { pt } from "./locales/pt";
import { pl } from "./locales/pl";
import { ru } from "./locales/ru";

type TranslationKey = keyof typeof en;

export enum Language {
    en = "en",
    de = "de",
    pt = "pt",
    pl = "pl",
    ru = "ru",
}

export const t = (key: TranslationKey, language: Language, params?: object) => {
    const translation = getTranslationFile(language)[key];
    if (params) {
        return format(translation, params);
    }
    return translation;
};

const getTranslationFile = (language: Language) => {
    switch (language) {
        case Language.en:
            return en;
        case Language.de:
            return de;
        case Language.pt:
            return pt;
        case Language.pl:
            return pl;
        case Language.ru:
            return ru;
        default:
            return en;
    }
};

const format = (translation: string, params: object) => {
    return translation.replace(/__([^\s\\]+)__/g, (_, key) => {
        return params[key];
    });
};
