// Google Fonts stylesheet URL for the site, derived from brand/tokens.json exactly the
// way scripts/fetch-fonts.mjs derives the vendored set — so a web page and a poster
// can never load different faces. The site links Google's CSS instead of embedding
// base64 because Google subsets per script and caches across sites.
import tokens from "./brand.js";

const GENERIC = new Set(["serif", "sans-serif", "monospace", "system-ui", "cursive"]);

const families = Object.entries(tokens.type)
  .filter(([key, def]) => key !== "scale" && def && typeof def === "object" && def.family)
  .map(([, def]) => {
    const first = def.family.split(",")[0].trim().replace(/^["']|["']$/g, "");
    if (GENERIC.has(first)) return null;
    return `family=${first.replace(/ /g, "+")}:wght@${(def.weights ?? [400, 700]).join(";")}`;
  })
  .filter(Boolean);

export default { href: `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap` };
