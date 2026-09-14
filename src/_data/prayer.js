// Prayer times from the committee's Google Sheet, fetched at build time, so the committee
// changes a time without touching the code. The deploy workflow also rebuilds on a
// schedule, so a sheet edit goes live within a few hours.
//
// Anything short of a complete, well-formed table returns null and the site shows no times
// at all. Placeholder times went live once (removed 2026-09-07) and must not again: a wrong
// jamaat time on a mosque site is worse than none.
//
// Sheet layout — one row per prayer, first row is headings:
//   নামাজ | Prayer  | আযান | জামাত
//   ফজর   | Fajr    | 4:45 | 5:15
//   ...     Dhuhr, Asr, Maghrib, Isha (all five required), Jumuah (optional)
//   হালনাগাদ | Updated | 14 সেপ্টেম্বর |        ← optional; shown under the table
// Times may use Latin or Bengali digits, "5:15" or "5.15".
import { readFileSync } from "node:fs";
import { latn } from "../../scripts/filters.mjs";

const site = JSON.parse(readFileSync(new URL("./site.json", import.meta.url), "utf8"));

const DAILY = [
  { key: "fajr", bn: "ফজর", name: "Fajr" },
  { key: "dhuhr", bn: "যোহর", name: "Dhuhr" },
  { key: "asr", bn: "আসর", name: "Asr" },
  { key: "maghrib", bn: "মাগরিব", name: "Maghrib" },
  { key: "isha", bn: "এশা", name: "Isha" },
];
const ALIASES = { zuhr: "dhuhr", zohr: "dhuhr", johr: "dhuhr", esha: "isha", jummah: "jumuah", juma: "jumuah", jumma: "jumuah", "jumu'ah": "jumuah" };

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.map((r) => r.map((c) => c.trim()));
}

function time(value) {
  const t = latn(value || "").replace(".", ":").trim();
  return /^\d{1,2}:\d{2}$/.test(t) ? t : null;
}

export default async function () {
  const url = site.prayerSheetCsv;
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000), redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const byKey = {};
    let updated = null;
    for (const [bnName, en, athan, iqamah] of parseCsv(await res.text())) {
      const key0 = (en || "").toLowerCase().replace(/\s+/g, "");
      const key = ALIASES[key0] || key0;
      if (key === "updated" || bnName === "হালনাগাদ") updated = athan || null;
      else byKey[key] = { athan: time(athan), iqamah: time(iqamah) };
    }
    const times = DAILY.map((p) => ({ ...p, ...byKey[p.key] }));
    const missing = times.filter((t) => !t.athan || !t.iqamah).map((t) => t.name);
    if (missing.length) throw new Error(`incomplete — no valid adhan/jamaat time for ${missing.join(", ")}`);
    const j = byKey.jumuah;
    return { times, jumuah: j && j.iqamah ? j : null, updated };
  } catch (e) {
    console.warn(`prayer: ${e.message} — prayer times hidden`);
    return null;
  }
}
