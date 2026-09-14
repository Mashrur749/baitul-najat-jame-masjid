// Prayer times from the committee's Google Sheet, fetched at build time, so the committee
// changes a time without touching the code. The deploy workflow also rebuilds on a
// schedule, and the sheet's "ওয়েবসাইট → এখনই আপডেট করুন" menu rebuilds on demand.
//
// Anything short of a complete, well-formed table returns { times: null, reason } and the
// site shows no times at all; the reason appears on /status/ for the admins. Placeholder
// times went live once (removed 2026-09-07) and must not again: a wrong jamaat time on a
// mosque site is worse than none.
//
// Sheet layout — one row per prayer, first row is headings:
//   নামাজ | Prayer  | আযান | জামাত
//   ফজর   | Fajr    | 4:45 | 5:15
//   ...     Dhuhr, Asr, Maghrib, Isha (all five required), Jumuah (optional)
//   হালনাগাদ | Updated | 14 সেপ্টেম্বর |        ← optional; shown under the table
// Times may use Latin or Bengali digits, "5:15", "5.15" or "5:15:00".
import { readFileSync } from "node:fs";
import { latn } from "../../scripts/filters.mjs";
import { parseCsv, sheetCsvUrl } from "../../scripts/csv.mjs";

const site = JSON.parse(readFileSync(new URL("./site.json", import.meta.url), "utf8"));
const SHEET = process.env.PRAYER_SHEET_CSV || site.prayerSheetCsv; // env: local testing

const DAILY = [
  { key: "fajr", bn: "ফজর", name: "Fajr" },
  { key: "dhuhr", bn: "যোহর", name: "Dhuhr" },
  { key: "asr", bn: "আসর", name: "Asr" },
  { key: "maghrib", bn: "মাগরিব", name: "Maghrib" },
  { key: "isha", bn: "এশা", name: "Isha" },
];
const ALIASES = { zuhr: "dhuhr", zohr: "dhuhr", johr: "dhuhr", esha: "isha", jummah: "jumuah", juma: "jumuah", jumma: "jumuah", "jumu'ah": "jumuah" };

function time(value) {
  // "5:15", "5.15", or "5:15:00" — the last is what Sheets exports if a cell became a time value.
  const t = latn(value || "").replace(".", ":").trim().replace(/^(\d{1,2}:\d{2}):00$/, "$1");
  return /^\d{1,2}:\d{2}$/.test(t) ? t : null;
}

export default async function () {
  if (!SHEET) return { times: null, reason: "শিটের লিংক এখনো দেওয়া হয়নি" };
  try {
    const res = await fetch(sheetCsvUrl(SHEET), { signal: AbortSignal.timeout(15000), redirect: "follow" });
    if (!res.ok) throw new Error(`শিট পাওয়া যায়নি (HTTP ${res.status})`);
    const text = await res.text();
    if (/^\s*<(!doctype|html)/i.test(text)) throw new Error("শিটটি \"Anyone with the link\" শেয়ার করা নেই");
    const byKey = {};
    let updated = null;
    for (const [bnName, en, athan, iqamah] of parseCsv(text)) {
      const key0 = (en || "").toLowerCase().replace(/\s+/g, "");
      const key = ALIASES[key0] || key0;
      if (key === "updated" || bnName === "হালনাগাদ") updated = athan || null;
      else byKey[key] = { athan: time(athan), iqamah: time(iqamah) };
    }
    const times = DAILY.map((p) => ({ ...p, ...byKey[p.key] }));
    const missing = times.filter((t) => !t.athan || !t.iqamah).map((t) => t.bn);
    if (missing.length) throw new Error(`সম্পূর্ণ নয় — আযান ও জামাতের সঠিক সময় নেই: ${missing.join(", ")}`);
    const j = byKey.jumuah;
    return { times, jumuah: j && j.iqamah ? j : null, updated, reason: null };
  } catch (e) {
    console.warn(`prayer: ${e.message} — prayer times hidden`);
    return { times: null, reason: e.message };
  }
}
