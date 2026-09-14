/**
 * Bengali digits from a second face.
 *
 * Hind Siliguri's ১ is a half-height hook: beside ৩ or a dash it reads as a broken glyph, not
 * a numeral ("১–৩১ অক্টোবর"). tokens.type.body.digitsFrom names a face whose digits are full
 * height. Its ten digit glyphs (U+09E6–09EF, a few KB via Google's `text=` subsetting) are
 * declared as extra @font-face rules of the BODY family itself, with a unicode-range. Where
 * faces of one family overlap, the one declared later wins, so these rules — emitted after
 * the body face's own — take the digits and nothing else. No font stack changes anywhere.
 *
 * Used by the site (src/_data/gfonts.js) and the asset renderer (scripts/fetch-fonts.mjs), so
 * a poster and a web page can never draw a digit differently.
 */
export const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

/** @font-face CSS (with remote woff2 URLs) for the digit faces, or "" if none configured. */
export async function digitFaces(tokens, userAgent) {
  const body = tokens.type.body;
  const source = body.digitsFrom?.family;
  if (!source) return "";
  const target = body.family.split(",")[0].trim().replace(/^["']|["']$/g, "");
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(source)}:wght@${(body.weights ?? [400, 700]).join(";")}`
    + `&text=${encodeURIComponent(BN_DIGITS)}&display=swap`;
  const res = await fetch(url, { headers: { "User-Agent": userAgent } });
  if (!res.ok) throw new Error(`${source} digits: HTTP ${res.status}`);
  const css = await res.text();
  if (!/@font-face/.test(css)) throw new Error(`${source} digits: no @font-face in response`);
  return css
    .replace(/font-family:\s*'[^']*';/g, `font-family: '${target}';`)
    .replace(/unicode-range:[^;]*;/g, "")
    .replace(/@font-face\s*\{/g, "@font-face {\n  unicode-range: U+09E6-09EF;");
}
