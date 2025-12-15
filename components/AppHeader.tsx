"use client";

import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/i18n/I18nProvider";

export function AppHeader() {
  const { t } = useI18n();
  return (
    <header className="mb-8 flex items-center justify-between gap-4">
      <div>
        <div className="text-lg font-semibold text-zinc-900">{t("appTitle")}</div>
        <div className="mt-1 text-xs text-zinc-500">{t("appSubtitle")}</div>
      </div>
      <LanguageToggle />
    </header>
  );
}




