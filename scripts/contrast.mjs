#!/usr/bin/env node
/**
 * WCAG contrast audit over brand/tokens.json.
 * Run before committing a palette change:  node scripts/contrast.mjs
 *
 * A community masjid audience includes elderly readers on phones in bright
 * hallways. Contrast here is a legibility requirement, not a compliance box.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tokens = JSON.parse(readFileSync(resolve(root, "brand/tokens.json"), "utf8"));

const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (hex) => {
  const [r, g, b] = hex.replace("#", "").match(/../g).map((h) => parseInt(h, 16) / 255);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const C = Object.fromEntries(Object.entries(tokens.color).map(([k, v]) => [k, v.value]));
const grounds = process.argv.slice(2).length ? process.argv.slice(2) : ["paper", "surface", "lime", "olive-deep", "ink"];

console.log(`Contrast audit — brand v${tokens.$meta.version}\n`);
let fails = 0;
for (const g of grounds) {
  if (!C[g]) continue;
  console.log(`on ${g} (${C[g]})`);
  for (const [name, hex] of Object.entries(C)) {
    if (name === g) continue;
    const r = ratio(hex, C[g]);
    const body = r >= 4.5, large = r >= 3;
    if (!large) continue;                        // hide pairs nobody would use
    const tag = body ? "body ok" : "LARGE TEXT ONLY (≥24px bold)";
    if (!body) fails++;
    console.log(`  ${name.padEnd(13)} ${r.toFixed(2).padStart(6)}:1  ${tag}`);
  }
  console.log();
}
console.log(fails ? `${fails} pair(s) are large-text-only — enforce via tokens.colorRules.` : "All usable pairs pass AA for body text.");
