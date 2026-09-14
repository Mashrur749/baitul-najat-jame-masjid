// Events for the homepage carousel, /events/ and one page per event — from the masjid
// admins' Google Sheet (its "আয়োজন" tab), fetched at build time. If the sheet is unset or
// unreachable, the committed copy in activities.csv is used, so the section never vanishes
// because Google had a bad minute. Incomplete rows are skipped with a warning, never guessed.
//
// Columns, in this order (first row = headings; the Bangla names are for the admins):
//   A শিরোনাম      title — required
//   B ধরন          category, e.g. কোর্স, প্রতিযোগিতা — optional
//   C শুরুর তারিখ  start — required: 2026-10-01, or 01/10/2026 (day first, Bangladeshi order)
//   D শেষ তারিখ    end — optional, for anything longer than a day
//   E সময়          free text, e.g. প্রতি শুক্র ও শনিবার, বিকাল ৪টা – মাগরিব
//   F স্থান         venue — optional
//   G বিবরণ        one or two sentences
//   H পোস্টার      a Google Drive link (file shared "Anyone with the link"), any image URL,
//                   or a file under src/images/ (e.g. events/calligraphy-2026.jpg)
//   I লিংক         optional: a page the event already has (e.g. /events/seerah-2026/)
//   J যোগাযোগ      optional phone number
//   K দেখাবে       হ্যাঁ / না — "না" hides the row
//
// Status comes from the dates against today in Dhaka: আসন্ন before the start, চলমান through
// the end date, সম্পন্ন after. The site rebuilds on a schedule, so the labels stay current.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { bnDateRange, latn } from "../../scripts/filters.mjs";
import { parseCsv } from "../../scripts/csv.mjs";

const ROOT = new URL("../../", import.meta.url);
const site = JSON.parse(readFileSync(new URL("src/_data/site.json", ROOT), "utf8"));
const FALLBACK = new URL("src/_data/activities.csv", ROOT);
// Downloaded posters land inside src/images/ so the image transform treats them like any
// other local photo. Gitignored; named by URL hash, so each is fetched once per machine.
const POSTERS = new URL("src/images/posters/", ROOT);
const CAROUSEL_MAX = 8;
const LABEL = { upcoming: "আসন্ন", ongoing: "চলমান", past: "সম্পন্ন" };

const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date());

function isoDate(value) {
  const v = latn(value || "").trim();
  let m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return ymd(+m[1], +m[2], +m[3]);
  m = v.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (m) return ymd(+m[3], +m[2], +m[1]);
  return null;
}

function ymd(y, mo, d) {
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null; // 31/02 and friends
  return dt.toISOString().slice(0, 10);
}

function driveId(url) {
  const m = url.match(/\/d\/([\w-]{20,})/) || url.match(/[?&]id=([\w-]{20,})/);
  return m ? m[1] : null;
}

async function poster(value, title) {
  const v = (value || "").trim();
  if (!v) return null;
  if (!/^https?:\/\//i.test(v)) {
    const rel = v.replace(/^\/?(images\/)?/, "");
    if (existsSync(new URL(`src/images/${rel}`, ROOT))) return `/images/${rel}`;
    console.warn(`activities: "${title}" — poster src/images/${rel} not found`);
    return null;
  }
  const id = driveId(v);
  const url = id ? `https://drive.google.com/uc?export=download&id=${id}` : v;
  const key = createHash("sha1").update(url).digest("hex").slice(0, 12);
  mkdirSync(POSTERS, { recursive: true });
  for (const ext of ["jpg", "png", "webp"]) {
    if (existsSync(new URL(`${key}.${ext}`, POSTERS))) return `/images/posters/${key}.${ext}`;
  }
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const type = (res.headers.get("content-type") || "").split(";")[0].trim();
    const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[type];
    if (!ext) throw new Error(`not an image (${type || "no type"}) — is the Drive file shared "Anyone with the link"?`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 15e6) throw new Error("larger than 15 MB");
    writeFileSync(new URL(`${key}.${ext}`, POSTERS), buf);
    return `/images/posters/${key}.${ext}`;
  } catch (e) {
    console.warn(`activities: "${title}" — poster not used: ${e.message}`);
    return null;
  }
}

async function load() {
  if (site.eventsSheetCsv) {
    try {
      const res = await fetch(site.eventsSheetCsv, { redirect: "follow", signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { text: await res.text(), source: "sheet" };
    } catch (e) {
      console.warn(`activities: sheet unreachable (${e.message}) — using src/_data/activities.csv`);
    }
  }
  return { text: readFileSync(FALLBACK, "utf8"), source: "activities.csv" };
}

export default async function () {
  const { text, source } = await load();
  const now = today();
  const items = [];
  for (const [i, r] of parseCsv(text).slice(1).entries()) {
    const [title, category, startRaw, endRaw, time, venue, summary, posterRaw, link, phone, show] =
      Array.from({ length: 11 }, (_, k) => (r[k] || "").trim());
    if (!title && !startRaw) continue; // blank row
    if (/^(না|no|n)$/i.test(show)) continue;
    const start = isoDate(startRaw);
    if (!title || !start) {
      console.warn(`activities: row ${i + 2} skipped — needs a title and a start date (got "${title}", "${startRaw}")`);
      continue;
    }
    const end = endRaw ? isoDate(endRaw) : null;
    if (endRaw && !end) console.warn(`activities: row ${i + 2} "${title}" — end date "${endRaw}" not understood, ignored`);
    const last = end && end > start ? end : start;
    const status = now < start ? "upcoming" : now <= last ? "ongoing" : "past";
    items.push({
      title, category, start, end: last, time, venue, summary, phone: phone || null, link: link || null,
      status, statusLabel: LABEL[status], dateText: bnDateRange(start, last),
      poster: await poster(posterRaw, title),
    });
  }

  // Events without a page of their own get one at /events/<start date>/, suffixed when two share a day.
  const seen = {};
  for (const a of items) {
    if (a.link) { a.href = a.link; continue; }
    seen[a.start] = (seen[a.start] || 0) + 1;
    a.slug = seen[a.start] === 1 ? a.start : `${a.start}-${seen[a.start]}`;
    a.href = `/events/${a.slug}/`;
  }

  // Running first, then upcoming (soonest first), then past (most recent first).
  const rank = { ongoing: 0, upcoming: 1, past: 2 };
  items.sort((a, b) => rank[a.status] - rank[b.status]
    || (a.status === "past" ? b.start.localeCompare(a.start) : a.start.localeCompare(b.start)));
  const current = items.filter((a) => a.status !== "past");
  const past = items.filter((a) => a.status === "past");
  console.log(`activities: ${items.length} from ${source} — ${current.length} running/upcoming, ${past.length} past`);
  return { items, current, past, carousel: items.slice(0, CAROUSEL_MAX), pages: items.filter((a) => !a.link), source };
}
