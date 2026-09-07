#!/usr/bin/env node
/**
 * Screenshot a built page so it can be read back and critiqued.
 *
 *   node scripts/shoot.mjs                          # full homepage
 *   node scripts/shoot.mjs --out dist/screens/hero.png --height 760 --viewport
 *   node scripts/shoot.mjs --url http://localhost:8099/about/
 *
 * Starts its own Eleventy server unless --url points at one already running,
 * because file:// cannot resolve the absolute /site.css the layout links.
 */
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import { existsSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const arg = (n, d = null) => {
  const i = process.argv.indexOf(`--${n}`);
  return i === -1 ? d : process.argv[i + 1] ?? true;
};
const has = (n) => process.argv.includes(`--${n}`);

const port = Number(arg("port", 8099));
const url = arg("url", `http://localhost:${port}/`);
const out = arg("out", "dist/screens/home.png");
const height = Number(arg("height", 900));
const fullPage = !has("viewport");

function chromePath() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!base || !existsSync(base)) return undefined;
  const d = readdirSync(base).find((x) => /^chromium-\d+$/.test(x));
  if (!d) return undefined;
  const p = join(base, d, "chrome-linux", "chrome");
  return existsSync(p) ? p : undefined;
}

async function reachable(u) {
  try { const r = await fetch(u, { signal: AbortSignal.timeout(1200) }); return r.ok; } catch { return false; }
}

let server;
if (!(await reachable(url))) {
  server = spawn("npx", ["eleventy", "--serve", "--port", String(port)], { stdio: "ignore", detached: false });
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline && !(await reachable(url))) await new Promise((r) => setTimeout(r, 400));
  if (!(await reachable(url))) { server.kill(); throw new Error(`Server never came up at ${url}`); }
}

try {
  mkdirSync(dirname(out), { recursive: true });
  const browser = await chromium.launch({ executablePath: chromePath() });
  const page = await browser.newPage({ viewport: { width: Number(arg("width", 1280)), height }, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: "networkidle" });
  // Lazy-loaded images never enter the viewport during a fullPage capture, so they
  // photograph as empty boxes. Scroll the page first and wait for decode, otherwise
  // every review of a long page is a review of placeholders.
  if (fullPage) {
    await page.evaluate(async () => {
      const step = window.innerHeight;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
      await Promise.all([...document.images].filter((i) => !i.complete).map((i) =>
        new Promise((r) => { i.onload = i.onerror = r; })));
    });
    await page.waitForTimeout(400);
  }
  await page.screenshot({ path: out, fullPage });
  await browser.close();
  console.log(`✓ ${out}`);
} finally {
  if (server) server.kill();
}
