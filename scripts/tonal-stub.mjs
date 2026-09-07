#!/usr/bin/env node
/**
 * Writes a brightness-matched stand-in over one placeholder so the hero scrim can
 * be tested honestly. The flat placeholders are light-on-light and would let an
 * illegible scrim pass review. Delete once real photography lands.
 *   node scripts/tonal-stub.mjs src/images/event-2026/exam-hall-wide.jpg
 */
import { chromium } from "playwright-core";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const out = process.argv[2] ?? "src/images/event-2026/exam-hall-wide.jpg";
let executablePath;
const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
if (base && existsSync(base)) {
  const d = readdirSync(base).find((x) => /^chromium-\d+$/.test(x));
  if (d) { const p = join(base, d, "chrome-linux", "chrome"); if (existsSync(p)) executablePath = p; }
}
const figures = Array.from({ length: 46 }, (_, i) => {
  const x = 90 + ((i * 167) % 1420), y = 430 + ((i * 233) % 700), s = 34 + (i % 5) * 13;
  const c = ["#8d7f6e", "#5d6470", "#b09a86", "#6f6357", "#a8a29a"][i % 5];
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${s}px;height:${s * 1.5}px;background:${c};border-radius:${s / 2}px"></div>`;
}).join("");
const html = `<body style="margin:0;width:1600px;height:1200px;background:linear-gradient(180deg,#fdfdfb 0%,#f2f0ea 32%,#dcdcd6 55%,#c8c8c2 100%)"><div style="position:absolute;inset:0">${figures}</div></body>`;

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
await page.setContent(html);
await page.screenshot({ path: out, type: "jpeg", quality: 80 });
await browser.close();
console.log(`✓ tonal stub → ${out}`);
