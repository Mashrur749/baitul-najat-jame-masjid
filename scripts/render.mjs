#!/usr/bin/env node
/**
 * The marketing-asset factory.
 *
 *   content JSON + Nunjucks template + brand tokens  ->  PNG / PDF
 *
 * Usage
 *   node scripts/render.mjs --all                 render every content file
 *   node scripts/render.mjs jumuah                render assets-src/content/jumuah.json
 *   node scripts/render.mjs jumuah --format pdf   print-ready vector output
 *   node scripts/render.mjs jumuah --html         also dump the intermediate HTML
 *
 * Output lands in dist/assets/<name>.<ext> — a predictable path, so Claude can
 * Read the PNG straight back and critique it. That feedback loop is the point.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname, basename, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import nunjucks from "nunjucks";
import { registerAll } from "./filters.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const R = (...p) => resolve(root, ...p);

/* ---------- args ---------- */
const argv = process.argv.slice(2);
const flag = (n, d = null) => {
  const i = argv.indexOf(`--${n}`);
  return i === -1 ? d : (argv[i + 1]?.startsWith("--") ? true : argv[i + 1] ?? true);
};
const has = (n) => argv.includes(`--${n}`);
const targets = argv.filter((a) => !a.startsWith("--") && !argv[argv.indexOf(a) - 1]?.match(/^--(format|scale)$/));

const tokens = JSON.parse(readFileSync(R("brand/tokens.json"), "utf8"));

/* ---------- resolve which content files to render ---------- */
const contentDir = R("assets-src/content");
function resolveContentFiles() {
  if (has("all") || targets.length === 0) {
    if (!existsSync(contentDir)) return [];
    return readdirSync(contentDir).filter((f) => f.endsWith(".json")).map((f) => join(contentDir, f));
  }
  return targets.map((t) => {
    for (const c of [t, R(t), join(contentDir, t), join(contentDir, `${t}.json`)]) {
      if (existsSync(c) && c.endsWith(".json")) return c;
    }
    throw new Error(`No content file for "${t}". Looked in assets-src/content/.`);
  });
}

/* ---------- inlined CSS + fonts ---------- */
const cssPath = R(".cache/assets.css");
if (!existsSync(cssPath)) {
  console.error("✗ Missing .cache/assets.css — run `npm run css:assets` first (or just `npm run assets`).");
  process.exit(1);
}
const tailwindCss = readFileSync(cssPath, "utf8");

function fontCss() {
  const f = R("brand/fonts/fonts.css");
  if (!existsSync(f)) {
    console.warn("  ⚠ brand/fonts/fonts.css missing — falling back to system fonts.");
    console.warn("    Run `npm run fonts` so renders match across machines.");
    return "";
  }
  return readFileSync(f, "utf8");
}

/* ---------- nunjucks ---------- */
const env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader([R("assets-src"), R("src/_includes"), R("src")]),
  { autoescape: true, trimBlocks: true, lstripBlocks: true }
);
registerAll((n, f) => env.addFilter(n, f));
// Templates render via setContent(), so relative image paths have no origin to resolve
// against. Embed repo images as data URIs instead: {{ "brand/logo/x.jpg" | inline }}
env.addFilter("inline", (p) => {
  const ext = p.split(".").pop().toLowerCase();
  const mime = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", svg: "image/svg+xml", webp: "image/webp" }[ext] ?? "application/octet-stream";
  return `data:${mime};base64,${readFileSync(R(p)).toString("base64")}`;
});
env.addFilter("date", (d, opts = {}) =>
  new Date(d).toLocaleDateString("en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric", ...opts })
);

/* ---------- browser ---------- */
async function launch() {
  const { chromium } = await import("playwright-core");
  // The container ships a Chromium whose revision may not match playwright-core's
  // expectation, so resolve the binary directly when a browsers path is set.
  let executablePath;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (base && existsSync(base)) {
    const dir = readdirSync(base).find((d) => /^chromium-\d+$/.test(d));
    if (dir) {
      const p = join(base, dir, "chrome-linux", "chrome");
      if (existsSync(p)) executablePath = p;
    }
  }
  return chromium.launch({ executablePath, args: ["--font-render-hinting=none", "--force-color-profile=srgb"] });
}

/* ---------- render one ---------- */
async function renderOne(browser, contentFile) {
  const spec = JSON.parse(readFileSync(contentFile, "utf8"));
  const name = spec.name ?? basename(contentFile, ".json");
  const boardName = spec.artboard ?? "social-square";
  const board = tokens.artboard[boardName];
  if (!board) throw new Error(`Unknown artboard "${boardName}" in ${basename(contentFile)}. Known: ${Object.keys(tokens.artboard).join(", ")}`);

  const format = String(flag("format", spec.format ?? "png"));
  const scale = Number(flag("scale", board.scale ?? 1));

  const body = env.render(`${spec.template}.njk`, {
    ...spec.data,
    brand: tokens,
    board,
    boardName,
  });

  const html = `<!doctype html><html lang="${spec.lang ?? "en"}"><head><meta charset="utf-8">
<style>${fontCss()}</style>
<style>${tailwindCss}</style>
<style>
  html,body{margin:0;padding:0;background:transparent}
  #artboard{width:${board.w}px;height:${board.h}px;overflow:hidden;position:relative}
  @page{size:${board.w}px ${board.h}px;margin:0}
</style></head>
<body><div id="artboard">${body}</div></body></html>`;

  mkdirSync(R("dist/assets"), { recursive: true });
  if (has("html")) writeFileSync(R(`dist/assets/${name}.html`), html);

  const page = await browser.newPage({
    viewport: { width: board.w, height: board.h },
    deviceScaleFactor: format === "pdf" ? 1 : scale,
  });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  // Overflow guard. #artboard clips with overflow:hidden, which makes scrollHeight
  // useless — content can spill past the edge and the render still "succeeds",
  // silently losing a footer. Measure with clipping momentarily disabled.
  const overflow = await page.evaluate(() => {
    const a = document.getElementById("artboard");
    const prev = a.style.overflow;
    a.style.overflow = "visible";
    // Bleed artwork inflates the scrollHeight of every ancestor that clips it,
    // which reads as content overflow when nothing is actually cut. Hide it for
    // the duration of the measurement.
    const bled = [...a.querySelectorAll("[data-bleed]")];
    const shown = bled.map((el) => el.style.display);
    bled.forEach((el) => (el.style.display = "none"));
    const boxH = a.clientHeight, boxW = a.clientWidth;
    const aRect = a.getBoundingClientRect();

    let bottom = 0, right = 0, above = 0, left = 0, inner = null;
    for (const el of a.querySelectorAll("*")) {
      // data-bleed marks artwork meant to run off the edge; skip it and its children.
      if (el.closest("[data-bleed]")) continue;
      const r = el.getBoundingClientRect();
      if (r.height || r.width) {
        bottom = Math.max(bottom, r.bottom - aRect.top);
        right = Math.max(right, r.right - aRect.left);
        // A centred flex item overflows symmetrically: half spills above the top
        // edge, where scrollHeight cannot see it. Measure that side explicitly.
        above = Math.max(above, aRect.top - r.top);
        left = Math.max(left, aRect.left - r.left);
      }
      // A flex child can be clamped to the artboard while its TEXT overflows
      // inside it. Rect measurement alone misses that, so check each box too.
      const dy = el.scrollHeight - el.clientHeight;
      const dx = el.scrollWidth - el.clientWidth;
      if ((dy > 1 || dx > 1) && getComputedStyle(el).overflow !== "visible") {
        if (!inner) inner = { tag: el.tagName.toLowerCase(), dy: Math.round(dy), dx: Math.round(dx) };
      }
    }
    bled.forEach((el, i) => (el.style.display = shown[i]));
    a.style.overflow = prev;
    return { y: Math.round(bottom - boxH), x: Math.round(right - boxW),
             top: Math.round(above), left: Math.round(left), inner };
  });

  const out = R(`dist/assets/${name}.${format}`);
  if (format === "pdf") {
    await page.pdf({ path: out, width: `${board.w}px`, height: `${board.h}px`, printBackground: true, pageRanges: "1" });
  } else {
    await page.locator("#artboard").screenshot({ path: out, type: "png" });
  }
  await page.close();

  const px = format === "pdf" ? `${board.w}×${board.h}pt` : `${board.w * scale}×${board.h * scale}px`;
  const clipped = overflow.y > 1 || overflow.x > 1 || overflow.top > 1 || overflow.left > 1 || !!overflow.inner;
  console.log(`  ${clipped ? "⚠" : "✓"} ${name}.${format}  [${boardName} ${px}]`);
  if (clipped) {
    const parts = [
      overflow.y > 1 && `${overflow.y}px below`,
      overflow.top > 1 && `${overflow.top}px above`,
      overflow.x > 1 && `${overflow.x}px right of`,
      overflow.left > 1 && `${overflow.left}px left of`,
    ].filter(Boolean);
    if (parts.length) console.log(`     CONTENT CLIPPED — ${parts.join(" and ")} the artboard edge.`);
    if (overflow.inner) console.log(`     CONTENT CLIPPED — text overflows its own <${overflow.inner.tag}> by ${overflow.inner.dy}px.`);
    console.log("     Cut copy, or move to a larger artboard.");
  }
  return { out, clipped };
}

/* ---------- main ---------- */
const files = resolveContentFiles();
if (files.length === 0) {
  console.log("No content files in assets-src/content/. Add one and re-run.");
  process.exit(0);
}
console.log(`Rendering ${files.length} asset(s) — brand v${tokens.$meta.version} (${tokens.$meta.status})`);
const browser = await launch();
const results = [];
try {
  for (const f of files) results.push(await renderOne(browser, f));
} finally {
  await browser.close();
}
console.log("→ dist/assets/");
const bad = results.filter((r) => r.clipped).length;
if (bad) {
  console.error(`\n✗ ${bad} asset(s) have clipped content. Fix before shipping.`);
  process.exitCode = 1;
}
