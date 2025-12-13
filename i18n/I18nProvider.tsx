"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Locale, MessageKey } from "./messages";
import { t as translate } from "./messages";

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("zh");

  useEffect(() => {
    const stored = window.localStorage.getItem("locale");
    if (stored === "en" || stored === "zh") setLocale(stored);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("locale", locale);
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, params) => translate(locale, key, params),
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}


