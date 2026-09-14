/**
 * Borrowed glyphs: a handful of characters drawn by a second face.
 *
 * - Bengali digits. Under lang="bn" the brand faces draw a half-height, hooked ১ (Hind
 *   Siliguri in body text, Noto Serif Bengali at the display weights); beside ৩ or a dash it
 *   reads as a broken glyph, not a numeral. A type token's `digitsFrom` names a face whose
 *   digits stay full height.
 * - Symbols a brand face lacks entirely, via `glyphsFrom: [{ family, text }]` — e.g. ﷺ, which
 *   Hind Siliguri doesn't contain, so browsers fell back to whatever the device had (Unifont,
 *   a pixel font, on Linux). It must be Amiri, the brand's Arabic face.
 *
 * The borrowed glyphs (a few KB each, via Google's `text=` subsetting) are declared as extra
 * @font-face rules of THAT token's family, with a unicode-range covering just those
 * characters. Where faces of one family overlap, the one declared later wins, so these rules —
 * emitted after the brand faces — take those characters and nothing else. No font stack
 * changes anywhere.
 *
 * Used by the site (src/_data/gfonts.js) and the asset renderer (scripts/fetch-fonts.mjs), so a
 * poster and a web page can never draw these characters differently.
 */
export const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

const firstFamily = (stack) => stack.split(",")[0].trim().replace(/^["']|["']$/g, "");
const unicodeRange = (text) => [...new Set([...text])].map((c) => `U+${c.codePointAt(0).toString(16).toUpperCase()}`).join(", ");

/** Every borrow declared in the type tokens: [{ key, target, source, text, weights }]. */
export function digitSources(tokens) {
  const out = [];
  for (const [key, def] of Object.entries(tokens.type)) {
    if (!def || typeof def !== "object" || !def.family) continue;
    const target = firstFamily(def.family);
    if (def.digitsFrom?.family) {
      out.push({ key, target, source: def.digitsFrom.family, text: BN_DIGITS, weights: def.digitsFrom.weights ?? def.weights ?? [400, 700] });
    }
    for (const g of def.glyphsFrom ?? []) {
      out.push({ key, target, source: g.family, text: g.text, weights: g.weights ?? def.weights ?? [400, 700] });
    }
  }
  return out;
}

/** @font-face CSS (remote woff2 URLs) for every borrow, or "" if none are configured. */
export async function digitFaces(tokens, userAgent) {
  let out = "";
  for (const { target, source, text, weights } of digitSources(tokens)) {
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(source)}:wght@${weights.join(";")}`
      + `&text=${encodeURIComponent(text)}&display=swap`;
    const res = await fetch(url, { headers: { "User-Agent": userAgent } });
    if (!res.ok) throw new Error(`${source} → ${target} (${text}): HTTP ${res.status}`);
    const css = await res.text();
    if (!/@font-face/.test(css)) throw new Error(`${source} → ${target} (${text}): no @font-face in response`);
    out += `/* ${target}: "${text}" from ${source} */\n` + css
      .replace(/font-family:\s*'[^']*';/g, `font-family: '${target}';`)
      .replace(/unicode-range:[^;]*;/g, "")
      .replace(/@font-face\s*\{/g, `@font-face {\n  unicode-range: ${unicodeRange(text)};`) + "\n";
  }
  return out;
}
