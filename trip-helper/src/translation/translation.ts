import { en } from "./locales/en";
import { de } from "./locales/de";
import { pt } from "./locales/pt";
import { pl } from "./locales/pl";
import { ru } from "./locales/ru";

export type TranslationKey = keyof typeof en;
export type TranslationParams = Record<string, string | number>;

type LanguagePreferenceTarget =
    | string
    | null
    | undefined
    | {
          language?: string | null;
          settings?: {
              preferences?: {
                  language?: string | null;
              };
          };
      };

export enum Language {
    en = "en",
    de = "de",
    pt = "pt",
    pl = "pl",
    ru = "ru",
}

const translationFiles: Record<Language, typeof en> = {
    [Language.en]: en,
    [Language.de]: de,
    [Language.pt]: pt,
    [Language.pl]: pl,
    [Language.ru]: ru,
};

export const t = (
    key: TranslationKey,
    language: Language,
    params?: TranslationParams
) => {
    const translationSet = getTranslationFile(language);
    const template = translationSet[key] ?? en[key] ?? key;
    if (params) {
        return format(template, params);
    }
    return template;
};

export const resolveLanguage = (languageCode?: string): Language => {
    if (!languageCode) {
        return Language.en;
    }

    const normalized = languageCode.toLowerCase().split("-")[0];
    const availableLanguages = Object.values(Language) as string[];
    if (availableLanguages.includes(normalized)) {
        return normalized as Language;
    }
    return Language.en;
};

export const getUserLanguage = (
    target?: LanguagePreferenceTarget
): Language => {
    if (!target) {
        return Language.en;
    }

    if (typeof target === "string") {
        return resolveLanguage(target);
    }

    const languageCode =
        target.language ?? target.settings?.preferences?.language;

    return resolveLanguage(languageCode ?? undefined);
};

const getTranslationFile = (language: Language) => {
    return translationFiles[language] ?? en;
};

const format = (translation: string, params: TranslationParams) => {
    return translation.replace(/__([^\s\\]+)__/g, (_, key: string) => {
        const value = params[key];
        if (value === undefined || value === null) {
            return `__${key}__`;
        }
        return String(value);
    });
};
