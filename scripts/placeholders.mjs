#!/usr/bin/env node
/**
 * Generates stand-in images for photos that are not in the repo yet, at the same
 * aspect ratio as the real files, so the layout can be built and reviewed before
 * the photography lands. Overwrite them with the real files of the same name.
 *
 * Deliberately ugly: a placeholder that looks like a photo is a placeholder that
 * ships by accident.
 */
import { chromium } from "playwright-core";
import { existsSync, readdirSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "src/images/event-2026");
mkdirSync(outDir, { recursive: true });

const shots = [
  "exam-hall-wide", "volunteer-helping-girl", "exam-girls-rows", "volunteer-assisting",
  "papers-distribution", "exam-mihrab-view", "hall-packed", "stage-dignitaries",
  "ceremony-audience", "hall-wide",
];

let executablePath;
const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
if (base && existsSync(base)) {
  const d = readdirSync(base).find((x) => /^chromium-\d+$/.test(x));
  if (d) { const p = join(base, d, "chrome-linux", "chrome"); if (existsSync(p)) executablePath = p; }
}
const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });

let made = 0, kept = 0;
for (const name of shots) {
  const out = join(outDir, `${name}.jpg`);
  if (existsSync(out) && !process.argv.includes("--force")) { kept++; continue; }
  await page.setContent(`<body style="margin:0;width:1600px;height:1200px;
    display:flex;align-items:center;justify-content:center;
    background:repeating-linear-gradient(45deg,#d8d3c2 0 40px,#cdc7b4 40px 80px);
    font:600 44px system-ui;color:#5E6B2C;text-align:center">
    <div><div style="font-size:64px">PLACEHOLDER</div>
    <div style="margin-top:16px;font-weight:400">${name}.jpg</div></div></body>`);
  await page.screenshot({ path: out, type: "jpeg", quality: 70 });
  made++;
}
await browser.close();
console.log(`✓ ${made} placeholder(s) written, ${kept} real photo(s) left alone → src/images/event-2026/`);
