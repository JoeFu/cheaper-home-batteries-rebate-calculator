"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? "";

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    const pagePath = search ? `${pathname}?${search}` : pathname;
    (window as any).gtag?.("config", GA_MEASUREMENT_ID, {
      page_path: pagePath,
    });
  }, [pathname, search]);

  return null;
}


