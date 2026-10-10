import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { dicts } from "./dicts";
import type { I18nContextValue, Lang } from "./types";

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", dir);
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
  };

  const t = (key: string, vars?: Record<string, string | number>) => {
    let str = dicts[lang][key] ?? dicts.en[key] ?? key;
    if (vars) for (const k of Object.keys(vars)) str = str.replace(`{${k}}`, String(vars[k]));
    return str;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir: lang === "ar" ? "rtl" : "ltr" }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = (): I18nContextValue => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n outside provider");
  return ctx;
};