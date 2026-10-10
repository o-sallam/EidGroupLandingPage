export type Lang = "ar" | "en" | "nl";
export type Dict = Record<string, string>;
export type QAPair = { q: string; a: string };
export type VideoMeta = { title: string; description: string };
export type I18nContextValue = {
 lang: Lang;
 setLang: (l: Lang) => void;
 t: (key: string, vars?: Record<string, string | number>) => string;
 dir: "ltr" | "rtl";
};