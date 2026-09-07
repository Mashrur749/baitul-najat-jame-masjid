#!/usr/bin/env node
/** Screenshot a built page so Claude can Read it back and critique the real render.
 *  node scripts/shoot.mjs _site/index.html [out.png] [width] */
import { chromium } from "playwright-core";
import { existsSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

const [file = "_site/index.html", out = "dist/screens/page.png", width = "1280"] = process.argv.slice(2);
let executablePath;
const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
if (base && existsSync(base)) {
  const d = readdirSync(base).find((x) => /^chromium-\d+$/.test(x));
  if (d) { const p = join(base, d, "chrome-linux", "chrome"); if (existsSync(p)) executablePath = p; }
}
const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: +width, height: 900 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(resolve(file)).href, { waitUntil: "networkidle" });
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log(`✓ ${out}`);
