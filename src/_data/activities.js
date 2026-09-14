// Events for the homepage carousel, /events/, one page per event and the admins' /status/
// page — from the masjid admins' Google Sheet (its "আয়োজন" tab), fetched at build time. If
// the sheet is unset or unreachable, the committed copy in activities.csv is used, so the
// section never vanishes because Google had a bad minute. Nothing is guessed: an incomplete
// row is skipped, and the reason is shown to the admins on /status/.
//
// Columns are matched by their heading (first row), so an admin inserting or moving a column
// can't shift data into the wrong field. Headings (Bangla, as in the sheet):
//   শিরোনাম           title — required
//   ধরন               category, e.g. কোর্স, প্রতিযোগিতা
//   শুরুর তারিখ       start — required: 2026-10-01, or 01/10/2026 (day first)
//   শেষ তারিখ         end, for anything longer than a day
//   সময়               free text, e.g. প্রতি শুক্র ও শনিবার, বিকাল ৪টা – মাগরিব
//   স্থান              venue
//   বিবরণ             one or two sentences (card + page)
//   পোস্টার           a Google Drive link (shared "Anyone with the link"), any image URL,
//                     or a file under src/images/ (e.g. events/calligraphy-2026.jpg)
//   লিংক              a page the event already has (e.g. /events/seerah-2026/) — then no page is made
//   যোগাযোগ           phone number
//   দেখাবে            হ্যাঁ / না — "না" hides the row
//   রেজিস্ট্রেশন লিংক  https:// link (e.g. a Google Form) — a button while the event is ahead or running
//   বিস্তারিত          longer write-up for the event's page; a blank line starts a new paragraph
//   ছবি               photo links for a gallery, one per line (max 12)
//   লিংক নাম (ইংরেজি)  the page address, e.g. calligraphy-2026 → /events/calligraphy-2026/;
//                     empty = the start date
//
// Status comes from the dates against today in Dhaka: আসন্ন before the start, চলমান through
// the end date, সম্পন্ন after. The site rebuilds on a schedule, so the labels stay current.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { bn, bnDate, bnDateRange, latn } from "../../scripts/filters.mjs";
import { parseCsv, sheetCsvUrl } from "../../scripts/csv.mjs";

const ROOT = new URL("../../", import.meta.url);
const site = JSON.parse(readFileSync(new URL("src/_data/site.json", ROOT), "utf8"));
const SHEET = process.env.EVENTS_SHEET_CSV || site.eventsSheetCsv; // env: local testing
const FALLBACK = new URL("src/_data/activities.csv", ROOT);
// Downloaded images land inside src/images/ so the image transform treats them like any other
// local photo. Gitignored; named by URL hash, so each is fetched once per machine.
const DOWNLOADS = new URL("src/images/posters/", ROOT);
const CAROUSEL_MAX = 8;
const MAX_PHOTOS = 12;
const LABEL = { upcoming: "আসন্ন", ongoing: "চলমান", past: "সম্পন্ন" };
const RESERVED = new Set(["seerah-2026", "status"]); // addresses taken by hand-built pages

const COLUMNS = [
  ["title", "শিরোনাম", "title"],
  ["category", "ধরন", "category", "type"],
  ["start", "শুরুর তারিখ", "start"],
  ["end", "শেষ তারিখ", "end"],
  ["time", "সময়", "time"],
  ["venue", "স্থান", "venue"],
  ["summary", "বিবরণ", "summary"],
  ["poster", "পোস্টার", "poster"],
  ["link", "লিংক", "link"],
  ["phone", "যোগাযোগ", "phone", "contact"],
  ["show", "দেখাবে", "show"],
  ["registration", "রেজিস্ট্রেশন লিংক", "registration"],
  ["details", "বিস্তারিত", "details"],
  ["photos", "ছবি", "photos"],
  ["slug", "লিংক নাম (ইংরেজি)", "লিংক নাম", "slug"],
];
const norm = (s) => String(s || "").normalize("NFC").toLowerCase().replace(/\s+/g, "");

function columnIndex(header) {
  const heads = header.map(norm);
  const at = {};
  for (const [key, ...names] of COLUMNS) {
    const i = heads.findIndex((h) => names.some((n) => norm(n) === h));
    if (i !== -1) at[key] = i;
  }
  // No recognisable heading row: fall back to the original column order.
  if (at.title === undefined || at.start === undefined) COLUMNS.forEach(([key], i) => { at[key] = i; });
  return at;
}

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

/** One image reference from the sheet → { src } for the page, or { warn } for /status/. */
async function image(value) {
  const v = (value || "").trim();
  if (!v) return {};
  if (!/^https?:\/\//i.test(v)) {
    const rel = v.replace(/^\/?(images\/)?/, "");
    return existsSync(new URL(`src/images/${rel}`, ROOT)) ? { src: `/images/${rel}` } : { warn: `ফাইল পাওয়া যায়নি: ${v}` };
  }
  const id = driveId(v);
  const url = id ? `https://drive.google.com/uc?export=download&id=${id}` : v;
  const key = createHash("sha1").update(url).digest("hex").slice(0, 12);
  mkdirSync(DOWNLOADS, { recursive: true });
  for (const ext of ["jpg", "png", "webp"]) {
    if (existsSync(new URL(`${key}.${ext}`, DOWNLOADS))) return { src: `/images/posters/${key}.${ext}` };
  }
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const type = (res.headers.get("content-type") || "").split(";")[0].trim();
    const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[type];
    if (!ext) throw new Error(`ছবি নয় — ড্রাইভ ফাইলটি "Anyone with the link" শেয়ার করা আছে কি?`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 15e6) throw new Error("১৫ MB-এর বেশি বড়");
    writeFileSync(new URL(`${key}.${ext}`, DOWNLOADS), buf);
    return { src: `/images/posters/${key}.${ext}` };
  } catch (e) {
    return { warn: `ছবি আনা যায়নি (${e.message}): ${v}` };
  }
}

async function load() {
  if (!SHEET) return { text: readFileSync(FALLBACK, "utf8"), source: "fallback", note: "শিটের লিংক এখনো দেওয়া হয়নি" };
  try {
    const res = await fetch(sheetCsvUrl(SHEET), { redirect: "follow", signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (/^\s*<(!doctype|html)/i.test(text)) throw new Error("শিটটি \"Anyone with the link\" শেয়ার করা নেই");
    return { text, source: "sheet", note: null };
  } catch (e) {
    console.warn(`activities: sheet unreachable (${e.message}) — using src/_data/activities.csv`);
    return { text: readFileSync(FALLBACK, "utf8"), source: "fallback", note: `শিট পাওয়া যায়নি (${e.message})` };
  }
}

export default async function () {
  const { text, source, note } = await load();
  const now = today();
  const [header = [], ...rows] = parseCsv(text);
  const col = columnIndex(header);
  const items = [], report = [];

  for (const [i, r] of rows.entries()) {
    const f = Object.fromEntries(COLUMNS.map(([key]) => [key, (r[col[key]] || "").trim()]));
    const line = { row: i + 2, title: f.title, notes: [] };
    if (!f.title && !f.start) continue; // blank row
    if (/^(না|no|n)$/i.test(f.show)) { report.push({ ...line, state: "hidden", notes: ["দেখাবে ঘরে \"না\""] }); continue; }
    const start = isoDate(f.start);
    if (!f.title || !start) {
      line.notes.push(!f.title ? "শিরোনাম নেই" : f.start ? `শুরুর তারিখ বোঝা যায়নি: "${f.start}" — লিখুন 2026-10-01` : "শুরুর তারিখ নেই");
      report.push({ ...line, state: "skipped" });
      console.warn(`activities: row ${line.row} skipped — ${line.notes.join("; ")}`);
      continue;
    }
    const end = f.end ? isoDate(f.end) : null;
    if (f.end && !end) line.notes.push(`শেষ তারিখ বোঝা যায়নি: "${f.end}" — বাদ দেওয়া হয়েছে`);
    const last = end && end > start ? end : start;
    const status = now < start ? "upcoming" : now <= last ? "ongoing" : "past";

    const poster = await image(f.poster);
    if (poster.warn) line.notes.push(`পোস্টার: ${poster.warn}`);
    const photos = [];
    for (const ref of f.photos.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean).slice(0, MAX_PHOTOS)) {
      const p = await image(ref);
      if (p.src) photos.push(p.src); else if (p.warn) line.notes.push(`ছবি: ${p.warn}`);
    }
    let registration = null;
    if (f.registration) {
      if (/^https?:\/\/\S+$/i.test(f.registration)) registration = f.registration;
      else line.notes.push("রেজিস্ট্রেশন লিংক https:// দিয়ে শুরু হয়নি — বাদ দেওয়া হয়েছে");
    }

    const a = {
      title: f.title, category: f.category, start, end: last, time: f.time, venue: f.venue,
      summary: f.summary, phone: f.phone || null, link: f.link || null, registration,
      details: f.details.split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean),
      photos, poster: poster.src || null,
      status, statusLabel: LABEL[status], dateText: bnDateRange(start, last),
      wantSlug: f.slug, line,
    };
    items.push(a);
    report.push(line);
    line.state = "shown";
    line.item = a;
  }

  // Page addresses: the English name if given, else the start date; never a taken one.
  const taken = new Set(RESERVED);
  for (const a of items) {
    if (a.link) { a.href = a.link; continue; }
    let base = a.wantSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (a.wantSlug && !base) a.line.notes.push(`লিংক নাম "${a.wantSlug}" ইংরেজি অক্ষরে নয় — তারিখ ব্যবহার হয়েছে`);
    base = base || a.start;
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
    if (slug !== base) a.line.notes.push(`"${base}" আগেই ব্যবহৃত — ঠিকানা হয়েছে ${slug}`);
    taken.add(slug);
    a.slug = slug;
    a.href = `/events/${slug}/`;
  }
  for (const a of items) { a.line.href = a.href; delete a.line; delete a.wantSlug; }
  for (const r of report) delete r.item;

  // Running first, then upcoming (soonest first), then past (most recent first).
  const rank = { ongoing: 0, upcoming: 1, past: 2 };
  items.sort((a, b) => rank[a.status] - rank[b.status]
    || (a.status === "past" ? b.start.localeCompare(a.start) : a.start.localeCompare(b.start)));
  const current = items.filter((a) => a.status !== "past");
  const past = items.filter((a) => a.status === "past");
  const hm = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date());
  const builtAt = `${bnDate(now)}, ${hm}`; // "১৫ সেপ্টেম্বর ২০২৬, ০২:৪৮", Dhaka time
  console.log(`activities: ${items.length} from ${source} — ${current.length} running/upcoming, ${past.length} past, ${report.length - items.length} not shown`);
  return {
    items, current, past, carousel: items.slice(0, CAROUSEL_MAX), pages: items.filter((a) => !a.link),
    source, sourceNote: note, report, builtAt: bn(builtAt),
  };
}
