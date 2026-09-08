// Google's @font-face CSS for the brand faces, fetched at build with a modern-Android UA
// (so it serves woff2 with unicode-range subsets) and inlined by the layout. Also finds the
// one file first paint needs — Hind Siliguri 400, Bengali subset — so it can be preloaded.
// Returns null when offline; the layout then falls back to a plain <link>.
import fonts from "./fonts.js";

const UA = "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36";

export default async function () {
  try {
    const res = await fetch(fonts.href, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const css = await res.text();
    const m = css.match(/\/\* bengali \*\/\s*@font-face \{[^}]*?font-family: 'Hind Siliguri';[^}]*?font-weight: 400;[^}]*?url\((https:[^)]+\.woff2)\)/);
    return { css, preload: m ? m[1] : null };
  } catch (e) {
    console.warn(`gfonts: ${e.message} — falling back to the stylesheet link`);
    return null;
  }
}
