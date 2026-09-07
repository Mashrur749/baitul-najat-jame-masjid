#!/usr/bin/env node
/**
 * Horizontal-overflow guard for the site. Loads a page at a viewport width and
 * reports anything wider than the viewport — the mobile bug screenshots hide,
 * because a full-page capture simply grows to fit the overflow.
 *
 *   node scripts/overflow.mjs 390                 # against http://localhost:8099/
 *   node scripts/overflow.mjs 360 http://localhost:8080/
 *
 * Exits non-zero when scrollWidth exceeds the viewport.
 */
import { chromium } from "playwright-core";

const width = Number(process.argv[2] || 390);
const url = process.argv[3] || "http://localhost:8099/";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 844 } });
await page.goto(url, { waitUntil: "networkidle" });
const r = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const wide = [];
  for (const el of document.querySelectorAll("body *")) {
    const b = el.getBoundingClientRect();
    if (b.right > vw + 1 || b.width > vw + 1) {
      const cls = typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 4).join(".") : "";
      wide.push(`${Math.round(b.width)}px right=${Math.round(b.right)} <${el.tagName.toLowerCase()}${cls}> ${(el.textContent || "").trim().slice(0, 40)}`);
    }
  }
  return { vw, sw: document.documentElement.scrollWidth, wide: wide.slice(0, 20) };
});
await browser.close();
const ok = r.sw <= r.vw;
console.log(`${ok ? "✓" : "✘"} ${width}px viewport — scrollWidth ${r.sw}`);
r.wide.forEach((l) => console.log("  " + l));
process.exit(ok ? 0 : 1);
