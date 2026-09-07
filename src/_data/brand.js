// Makes every brand token available to site templates as {{ brand.color.primary.value }}.
// Same JSON the poster templates read — one source, two consumers.
import { readFileSync } from "node:fs";
export default JSON.parse(readFileSync(new URL("../../brand/tokens.json", import.meta.url), "utf8"));
