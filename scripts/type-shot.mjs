import { chromium } from "playwright-core";
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
let executablePath;
const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
if (base && existsSync(base)) {
  const d = readdirSync(base).find((x) => /^chromium-\d+$/.test(x));
  if (d) { const p = join(base, d, "chrome-linux", "chrome"); if (existsSync(p)) executablePath = p; }
}
const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: 1900, height: 700 } });
await page.goto(pathToFileURL(resolve(process.argv[2])).href, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: process.argv[3], fullPage: true });
await browser.close();
console.log("✓ " + process.argv[3]);
