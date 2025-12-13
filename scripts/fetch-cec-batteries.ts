/**
 * Fetches the CEC approved solar batteries CSV from CER and writes a JSON snapshot.
 *
 * Source page: https://cer.gov.au/document_page/cec-approved-solar-batteries
 *
 * This script is intended to run at build time (e.g. npm prebuild) so the UI can
 * ship with a stable, fast, searchable battery list.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

type BatteryRecord = {
  manufacturer: string;
  model: string;
  usable_kwh: number | null;
  // keep a few optional fields for future UI enhancements/debugging
  raw?: Record<string, string>;
};

const SOURCE_PAGE_URL = "https://cer.gov.au/document_page/cec-approved-solar-batteries";
const OUT_DIR = path.join(process.cwd(), "data");
const OUT_JSON = path.join(OUT_DIR, "cec-batteries.json");
const OUT_META = path.join(OUT_DIR, "cec-batteries.meta.json");

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  // We can't directly pass controller to arbitrary promises; only used for fetch below.
  // This wrapper is mostly used for consistent error messaging.
  return Promise.race([
    promise.finally(() => clearTimeout(timeout)),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
    ),
  ]);
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "user-agent": "cheaper-home-batteries-rebate-calculator/1.0 (+build-time snapshot)",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
  return await res.text();
}

async function fetchTextWithContentType(
  url: string,
  accept: string,
): Promise<{ text: string; contentType: string | null }> {
  const res = await fetch(url, {
    headers: {
      "user-agent": "cheaper-home-batteries-rebate-calculator/1.0 (+build-time snapshot)",
      accept,
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
  return { text: await res.text(), contentType: res.headers.get("content-type") };
}

async function fetchCsv(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "user-agent": "cheaper-home-batteries-rebate-calculator/1.0 (+build-time snapshot)",
      accept: "text/csv,*/*",
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch CSV ${url}: HTTP ${res.status}`);
  return await res.text();
}

function findFirstCsvUrlFromHtml(html: string): string | null {
  // CER pages sometimes link to a document endpoint like /document/<name>
  // rather than a direct *.csv URL.
  // Prefer a link whose text or icon indicates CSV.
  const linkRe = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  const candidates: { href: string; score: number }[] = [];

  while ((m = linkRe.exec(html)) !== null) {
    const href = m[1];
    const inner = m[2].toLowerCase();
    const hrefLower = href.toLowerCase();

    let score = 0;
    if (hrefLower.includes(".csv")) score += 5;
    if (inner.includes("csv")) score += 3;
    if (inner.includes("icon-file-csv")) score += 3;
    if (hrefLower.includes("/document/")) score += 1;
    if (score > 0) candidates.push({ href, score });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.href ?? null;
}

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let i = 0;
  let inQuotes = false;

  // Normalize newlines.
  const s = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  while (i < s.length) {
    const ch = s[i];

    if (inQuotes) {
      if (ch === '"') {
        const next = s[i + 1];
        if (next === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      cell += ch;
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      i += 1;
      continue;
    }
    if (ch === "\n") {
      row.push(cell);
      cell = "";
      // skip completely empty trailing rows
      if (row.some((v) => v.trim().length > 0)) rows.push(row);
      row = [];
      i += 1;
      continue;
    }
    cell += ch;
    i += 1;
  }

  // Last cell
  row.push(cell);
  if (row.some((v) => v.trim().length > 0)) rows.push(row);

  if (rows.length === 0) return { headers: [], rows: [] };
  const headers = rows[0].map((h) => h.trim());
  const dataRows = rows.slice(1);
  return { headers, rows: dataRows };
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, " ");
}

function pickColumn(headers: string[], candidates: (h: string) => boolean): number | null {
  for (let i = 0; i < headers.length; i++) {
    if (candidates(normalizeHeader(headers[i]))) return i;
  }
  return null;
}

function toNumberOrNull(value: string): number | null {
  const cleaned = value
    .trim()
    .replace(/[^\d.]+/g, "")
    .replace(/^(\.)+/, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return n;
}

function buildRecords(headers: string[], rows: string[][]): {
  records: BatteryRecord[];
  columnMapping: { manufacturer: string; model: string; usable: string };
} {
  const manufacturerIdx =
    pickColumn(headers, (h) => h.includes("manufacturer")) ??
    pickColumn(headers, (h) => h.includes("brand")) ??
    pickColumn(headers, (h) => h.includes("make"));
  const modelIdx = pickColumn(headers, (h) => h === "model" || h.includes("model"));
  const usableIdx =
    pickColumn(headers, (h) => h.includes("usable") && (h.includes("kwh") || h.includes("capacity"))) ??
    pickColumn(headers, (h) => h.includes("usable"));

  if (manufacturerIdx == null || modelIdx == null || usableIdx == null) {
    throw new Error(
      `Unable to locate required columns in CSV headers. Found headers: ${headers.join(" | ")}`,
    );
  }

  const columnMapping = {
    manufacturer: headers[manufacturerIdx],
    model: headers[modelIdx],
    usable: headers[usableIdx],
  };

  const records: BatteryRecord[] = [];
  for (const r of rows) {
    const manufacturer = (r[manufacturerIdx] ?? "").trim();
    const model = (r[modelIdx] ?? "").trim();
    if (!manufacturer || !model) continue;
    const usable_kwh = toNumberOrNull(r[usableIdx] ?? "");

    records.push({
      manufacturer,
      model,
      usable_kwh,
    });
  }

  records.sort((a, b) => {
    const m = a.manufacturer.localeCompare(b.manufacturer);
    if (m !== 0) return m;
    return a.model.localeCompare(b.model);
  });

  return { records, columnMapping };
}

async function main() {
  const fetchedAt = new Date().toISOString();

  const html = await withTimeout(fetchText(SOURCE_PAGE_URL), 30_000, "Fetch source page");
  const csvHref = findFirstCsvUrlFromHtml(html);
  if (!csvHref) throw new Error("Could not find a .csv link on the source page.");

  const candidateUrl = new URL(csvHref, SOURCE_PAGE_URL).toString();
  // If this is a CER document endpoint, fetch it and find the direct CSV file link.
  const candidateLower = candidateUrl.toLowerCase();
  let csvUrl = candidateUrl;
  let csvText: string;
  if (candidateLower.includes("/document/") && !candidateLower.includes(".csv")) {
    // Some /document/* endpoints return the file body directly (CSV) without a .csv URL.
    const { text, contentType } = await withTimeout(
      fetchTextWithContentType(candidateUrl, "text/csv,text/html,*/*"),
      30_000,
      "Fetch document endpoint",
    );
    const ct = (contentType ?? "").toLowerCase();
    if (ct.includes("text/csv") || ct.includes("application/csv")) {
      csvText = text;
    } else {
      // Treat as HTML and look for a direct CSV link within the document page.
      const directCsvHref = findFirstCsvUrlFromHtml(text);
      if (!directCsvHref) {
        throw new Error(`Could not find a direct CSV link on document page: ${candidateUrl}`);
      }
      csvUrl = new URL(directCsvHref, candidateUrl).toString();
      csvText = await withTimeout(fetchCsv(csvUrl), 30_000, "Fetch CSV");
    }
  } else {
    csvText = await withTimeout(fetchCsv(csvUrl), 30_000, "Fetch CSV");
  }

  const { headers, rows } = parseCsv(csvText);
  const { records, columnMapping } = buildRecords(headers, rows);

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify(records, null, 2), "utf8");
  await writeFile(
    OUT_META,
    JSON.stringify(
      {
        fetchedAt,
        sourcePageUrl: SOURCE_PAGE_URL,
        sourceCsvUrl: csvUrl,
        recordCount: records.length,
        columnMapping,
      },
      null,
      2,
    ),
    "utf8",
  );

  // eslint-disable-next-line no-console
  console.log(
    `Wrote ${records.length} battery records to ${path.relative(process.cwd(), OUT_JSON)}`,
  );
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});


