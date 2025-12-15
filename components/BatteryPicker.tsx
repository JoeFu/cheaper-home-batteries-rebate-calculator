"use client";

import { useEffect, useMemo, useState } from "react";
import {
  cecBatteries,
  type CecBattery,
  cecMeta,
  formatBatteryLabel,
  searchBatteries,
} from "@/lib/batteries";
import { useI18n } from "@/i18n/I18nProvider";

export type BatteryPickerProps = {
  value: CecBattery | null;
  onChange: (battery: CecBattery | null) => void;
  onAutoFillUsableKWh?: (usableKWh: number | null) => void;
};

export function BatteryPicker({ value, onChange, onAutoFillUsableKWh }: BatteryPickerProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState<string>(value ? formatBatteryLabel(value) : "");
  const [open, setOpen] = useState(false);

  const PAGE_SIZE = 30;
  const [limit, setLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [query]);

  const results = useMemo(() => searchBatteries(query, limit), [query, limit]);
  const maybeHasMore = results.length === limit && limit < cecBatteries.length;

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-medium text-zinc-900">{t("cecApprovedBattery")}</div>
          <div className="text-xs text-zinc-500">
            {t("snapshot")}: {new Date(cecMeta.fetchedAt).toLocaleDateString()}
          </div>
        </div>
        {value ? (
          <button
            type="button"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
            onClick={() => {
              onChange(null);
              onAutoFillUsableKWh?.(null);
              setQuery("");
              setOpen(false);
            }}
          >
            {t("clear")}
          </button>
        ) : null}
      </div>

      <div className="relative">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Small delay so click can register.
            setTimeout(() => setOpen(false), 150);
          }}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-300"
        />

        {open ? (
          <div
            className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-lg border border-zinc-200 bg-white shadow-lg"
            onMouseDown={(e) => {
              // Keep focus on the input so the menu doesn't close while scrolling.
              e.preventDefault();
            }}
            onScroll={(e) => {
              const el = e.currentTarget;
              const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
              if (remaining < 80 && results.length === limit) {
                setLimit((prev) => Math.min(prev + PAGE_SIZE, cecBatteries.length));
              }
            }}
          >
            {results.length === 0 ? (
              <div className="px-3 py-3 text-sm text-zinc-500">{t("noMatches")}</div>
            ) : (
              <div>
                <ul className="divide-y divide-zinc-100">
                  {results.map((b) => {
                    const label = formatBatteryLabel(b);
                    const usable = b.usable_kwh;
                    return (
                      <li key={`${b.manufacturer}__${b.model}`}>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-zinc-50"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            onChange(b);
                            if (typeof usable === "number") onAutoFillUsableKWh?.(usable);
                            setQuery(label);
                            setOpen(false);
                          }}
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-zinc-900">{label}</div>
                            <div className="truncate text-xs text-zinc-500">
                              {t("usable")}:{" "}
                              {typeof usable === "number" ? `${usable} kWh` : t("unknown")}
                            </div>
                          </div>
                          <div className="text-xs text-zinc-500">{t("select")}</div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {maybeHasMore ? (
                  <div className="px-3 py-2 text-xs text-zinc-500">{t("scrollToLoadMore")}</div>
                ) : null}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}


