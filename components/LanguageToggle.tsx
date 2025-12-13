"use client";

import { useI18n } from "@/i18n/I18nProvider";

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white p-1 text-xs">
      <button
        type="button"
        className={`rounded-full px-3 py-1 font-medium ${
          locale === "zh" ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-50"
        }`}
        onClick={() => setLocale("zh")}
      >
        中文
      </button>
      <button
        type="button"
        className={`rounded-full px-3 py-1 font-medium ${
          locale === "en" ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-50"
        }`}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
    </div>
  );
}


