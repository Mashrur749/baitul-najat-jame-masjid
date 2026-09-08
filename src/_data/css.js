// dist/site.css, read at build so the layout can inline it. `npm run css:site` runs before
// Eleventy in every script that builds the site, so the file is always fresh here.
import { readFileSync } from "node:fs";
export default () => ({ inline: readFileSync(new URL("../../dist/site.css", import.meta.url), "utf8") });
