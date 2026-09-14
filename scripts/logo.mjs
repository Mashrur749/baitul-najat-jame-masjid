/**
 * The masjid's logo — the dome-and-minaret mark with the BAITUN NAJAT / JAME MOSQUE wordmark —
 * redrawn as vector from the only copy we have: the top of the calligraphy course poster
 * (src/images/events/calligraphy-2026.jpg, where the whole logo is ~110 px wide).
 *
 *   node scripts/logo.mjs
 *
 * Geometry is authored in the coordinate space of a 10× crop of that poster (crop origin
 * 280,10), which is how it was fitted: every dome edge and arch line below is the measured
 * midpoint of the poster's thresholded pixels, row by row, and matches it to within ~2 units
 * (0.2 poster px). The wordmark is outlined from Cinzel, an open Trajan-style face whose
 * lowercase are small caps, as the poster's are. If the committee ever finds the original
 * design file, it replaces all of this.
 *
 * Writes (colours from brand/tokens.json, never typed here):
 *   brand/logo/baitun-najat-logo.svg     full lockup, ink — the master file
 *   brand/logo/baitun-najat-mark.svg     mark only, ink
 *   brand/logo/favicon.svg               ink mark on the lime sun
 *   brand/logo/apple-touch-icon.png      180×180, for "Add to home screen"
 *   src/_includes/macros/logo.njk        mark() and lockup() for the site and assets, currentColor
 */
import opentype from "opentype.js";
import sharp from "sharp";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";

const R = (p) => new URL("../" + p, import.meta.url).pathname;
const tokens = JSON.parse(readFileSync(R("brand/tokens.json"), "utf8"));
const C = (k) => tokens.color[k].value;

// ---------- Cinzel, fetched once into .cache ----------
async function cinzel(weight) {
  const file = R(`.cache/cinzel-${weight}.ttf`);
  if (!existsSync(file)) {
    mkdirSync(R(".cache"), { recursive: true });
    // An old user agent makes Google Fonts answer with TTF, which opentype.js reads directly.
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Cinzel:wght@${weight}`, { headers: { "User-Agent": "Mozilla/4.0" } })).text();
    const url = css.match(/url\((https:[^)]+\.ttf)\)/)?.[1];
    if (!url) throw new Error(`No TTF URL for Cinzel ${weight} in:\n${css}`);
    writeFileSync(file, Buffer.from(await (await fetch(url)).arrayBuffer()));
  }
  return opentype.parse(readFileSync(file).buffer);
}

// ---------- curve helpers ----------
const f = (n) => +n.toFixed(1);
// Catmull-Rom through the points, as cubic Béziers.
function smooth(pts, t = 0.5) {
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) * t / 3, p1[1] + (p2[1] - p0[1]) * t / 3];
    const c2 = [p2[0] - (p3[0] - p1[0]) * t / 3, p2[1] - (p3[1] - p1[1]) * t / 3];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}
const cont = (pts) => smooth(pts).replace(/^M[^C]*/, ""); // the same curve, continuing a path
// Rectangle; r rounds the top corners only (the minaret's windows are arched, not pills).
const rect = (x, y, w, h, r = 0) =>
  r ? `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h}H${x}V${y + r}Q${x} ${y} ${x + r} ${y}Z`
    : `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
const circle = (x, y, r) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;

// A pointed arch is two circle arcs, and so is every curve in this mark. Each measured point
// set gets a least-squares circle (Kåsa fit); the curve is drawn as a true SVG arc, so edges
// come out as the designer's compass drew them rather than following pixel noise.
function fitCircle(pts, label) {
  let [sx, sy, sxx, syy, sxy, sz, szx, szy, n] = [0, 0, 0, 0, 0, 0, 0, 0, pts.length];
  for (const [x, y] of pts) { const z = x * x + y * y; sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y; sz += z; szx += z * x; szy += z * y; }
  // Solve [sxx sxy sx; sxy syy sy; sx sy n]·[D E F] = −[szx szy sz] by Cramer's rule.
  const det3 = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const A = [[sxx, sxy, sx], [sxy, syy, sy], [sx, sy, n]], b = [-szx, -szy, -sz], d = det3(A);
  const [D, E, F] = [0, 1, 2].map((k) => det3(A.map((row, i) => row.map((v, j) => (j === k ? b[i] : v)))) / d);
  const c = { x: -D / 2, y: -E / 2 }; c.r = Math.sqrt(c.x * c.x + c.y * c.y - F);
  c.err = Math.max(...pts.map(([x, y]) => Math.abs(Math.hypot(x - c.x, y - c.y) - c.r)));
  fits.push(`${label} r${c.r.toFixed(0)} max dev ${c.err.toFixed(1)}`);
  return c;
}
const fits = [];
// Put a point onto the circle: radially, or — for a foot — where the circle meets y.
const onCircle = (c, [x, y], footY = null) => {
  if (footY !== null) { const dx = Math.sqrt(c.r * c.r - (footY - c.y) ** 2); return [x < c.x ? c.x - dx : c.x + dx, footY]; }
  const k = c.r / Math.hypot(x - c.x, y - c.y); return [c.x + (x - c.x) * k, c.y + (y - c.y) * k];
};
// The arc through a measured run, from its first point to its last (feet land at footY).
function arc(pts, label, { move = true, footY = BASE + 3 } = {}) {
  const c = fitCircle(pts, label);
  const ends = [pts[0], pts.at(-1)].map((p) => onCircle(c, p, p[1] === BASE ? footY : null));
  const [p0, p1, pm] = [ends[0], ends[1], pts[Math.floor(pts.length / 2)]];
  const sweep = (pm[0] - p0[0]) * (p1[1] - p0[1]) - (pm[1] - p0[1]) * (p1[0] - p0[0]) > 0 ? 1 : 0; // clockwise on screen
  return { d: `${move ? `M${f(p0[0])} ${f(p0[1])}` : ""}A${f(c.r)} ${f(c.r)} 0 0 ${sweep} ${f(p1[0])} ${f(p1[1])}`, start: p0, end: p1, r: c.r, sweep };
}

// ---------- the mark ----------
const BASE = 752;                       // top of the ground line; everything stands on it
const apex = [493, 306];
const domeL = [[334, 480], [343, 465], [352, 450], [364, 435], [375, 420], [387, 405], [400, 390], [414, 375], [430, 360], [446, 345], [463, 330], [484, 315], apex];
const domeR = [apex, [505, 315], [526, 330], [544, 345], [560, 360], [576, 375], [588, 390], [601, 405], [625, 435], [637, 450], [645, 465], [654, 480], [660, 490], [671, 510], [684, 540], [696, 570], [709, 610], [715, 650], [721, 690], [723, 720], [724, BASE]];
// The outermost arch line: measured centre points, from under the balcony down to its foot.
const arch0Pts = [[336, 456], [324, 472], [314, 490], [304, 510], [295, 540], [286, 570], [275, 610], [266, 650], [261, 690], [259, 720], [258, BASE]];
// The dome's body and its flank behind the minaret both run along that line, which is cut
// between them; under the balcony the body's edge leaves it and a notch of ground shows.
const a0Lower = arc(arch0Pts.slice(3).reverse(), "body along arch0", { footY: BASE });   // foot → (304,510)
const left = arc(domeL, "dome left edge", { move: false });
const right = arc(domeR, "dome right edge", { move: false, footY: BASE });
// One straight edge across the notch (through the measured 318,505 / 329,490), mostly under the cut.
const dome = a0Lower.d + ` L${f(left.start[0])} ${f(left.start[1])}` + left.d + ` L${apex[0]} ${apex[1]}` +
  `L${f(right.start[0])} ${f(right.start[1])}` + right.d + "Z";
// The same arc, walked the other way (so the sweep flips), closes the flank.
const flank = `M244 ${BASE} L244 468 L302 468 L${f(a0Lower.end[0])} ${f(a0Lower.end[1])}` +
  `A${f(a0Lower.r)} ${f(a0Lower.r)} 0 0 ${1 - a0Lower.sweep} ${f(a0Lower.start[0])} ${f(a0Lower.start[1])}Z`;

const cx = 237;                         // the minaret's axis
const capL = [[196, 294], [199, 266], [211, 236], [226, 213], [cx, 198]];
const capR = capL.slice(0, -1).reverse().map(([x, y]) => [2 * cx - x, y]);
// Separate paths: overlapping subpaths drawn in opposite directions would cancel each other.
const minaret = [
  rect(188, 468, 60, BASE - 468),                   // shaft
  rect(168, 432, 137, 38, 3),                       // balcony
  rect(198, 306, 78, 130),                          // drum
  "M181 306 L186 293 H288 L293 306 Z",              // eave, pointed at both ends
  smooth(capL) + cont([[cx, 198], ...capR]) + "Z",  // onion cap
  rect(cx - 3, 146, 6, 56),                         // finial rod, up into the crescent
  circle(cx, 176, 7),                               // finial bulb
  circle(231, 130, 24),                             // crescent disc (its bite is cut below)
];
const ground = rect(140, BASE, 620, 6);

// Cut through the silhouette: two nested pointed arches whose left legs run on past their
// apex to the next line out, the outer arch line, the windows, the grooves, the crescent's
// bite and a hairline down the minaret's axis.
const arches = [
  ["arch0", arch0Pts],
  ["arch1 left", [[341, BASE], [343, 720], [349, 690], [358, 650], [371, 610], [391, 570], [412, 540], [440, 510], [462, 490], [484, 475], [520, 451], [560, 437], [600, 425], [635, 417]]],
  ["arch1 right", [[498, 466], [520, 485], [548, 510], [574, 540], [597, 570], [617, 610], [630, 650], [640, 690], [645, 720], [647, BASE]]],
  ["arch2 left", [[397, BASE], [398, 720], [404, 690], [419, 650], [447, 610], [470, 588], [494, 572], [520, 559], [550, 546], [575, 536]]],
  ["arch2 right", [[496, 573], [520, 590], [539, 610], [556, 632], [566, 650], [580, 690], [588, 720], [589, BASE]]],
].map(([label, p]) => arc(p, label).d);
const holes = [
  rect(206, 344, 20, 93, 10), rect(248, 344, 20, 93, 10),
  rect(166, 485, 74, 14), rect(166, 521, 76, 17),
  circle(241, 121, 22),
].join(" ");

// The mask is luminance: white keeps, black cuts. Those two values are mask mechanics, not
// brand colour — the visible colour is always the caller's (fill / currentColor).
const markBody = (id) => `<mask id="${id}" maskUnits="userSpaceOnUse" x="100" y="80" width="700" height="700"><rect x="100" y="80" width="700" height="700" fill="#fff"/><g fill="none" stroke="#000" stroke-width="15">${arches.map((d) => `<path d="${d}"/>`).join("")}</g><path d="M${cx} 232V${BASE}" stroke="#000" stroke-width="3"/><path d="${holes}" fill="#000"/></mask><g mask="url(#${id})"><path d="${dome}"/><path d="${flank}"/>${minaret.map((d) => `<path d="${d}"/>`).join("")}</g><path d="${ground}"/>`;
const MARK_VB = [140, 104, 620, 654];

// ---------- the wordmark, outlined ----------
const [serif, serifBold] = [await cinzel(600), await cinzel(700)];
function setLine(font, text, { size, tracking, x, baseline }) {
  const scale = size / font.unitsPerEm, glyphs = [...text].map((c) => font.charToGlyph(c));
  const w = glyphs.reduce((s, g, i) => s + g.advanceWidth * scale + (i < glyphs.length - 1 ? tracking * size : 0), 0);
  const path = new opentype.Path();
  let pen = x - w / 2;
  for (const g of glyphs) { path.extend(g.getPath(pen, baseline, size)); pen += g.advanceWidth * scale + tracking * size; }
  return { d: path.toPathData(1), w, box: path.getBoundingBox() };
}
const CX = 462;                         // the wordmark's centre line, as measured on the poster
const name = setLine(serif, "Baitun Najat", { size: 142, tracking: 0.012, x: CX, baseline: 906 });
const sub = setLine(serifBold, "JAME MOSQUE", { size: 54, tracking: 0.18, x: CX, baseline: 984 });
const half = 1025 / 2, gap = 26, ruleW = half - sub.w / 2 - gap;
const rules = rect(f(CX - half), 963, f(ruleW), 5) + " " + rect(f(CX + sub.w / 2 + gap), 963, f(ruleW), 5);
const x0 = Math.floor(Math.min(name.box.x1, CX - half, MARK_VB[0])), x1 = Math.ceil(Math.max(name.box.x2, CX + half, MARK_VB[0] + MARK_VB[2]));
const y1 = Math.ceil(Math.max(name.box.y2, sub.box.y2));
const LOCKUP_VB = [x0, MARK_VB[1], x1 - x0, y1 - MARK_VB[1]];
const lockupBody = (id) => `${markBody(id)}<path d="${name.d}"/><path d="${sub.d}"/><path d="${rules}"/>`;

// ---------- files ----------
const LABEL = "Baitun Najat Jame Mosque";
const svg = (vb, body, fill, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(" ")}" role="img" aria-label="${LABEL}" fill="${fill}"${extra}>${body}</svg>\n`;
const header = "<!-- Baitun Najat Jame Mosque logo, redrawn from the calligraphy course poster. Generated by scripts/logo.mjs — edit there, not here. -->\n";
writeFileSync(R("brand/logo/baitun-najat-logo.svg"), header + svg(LOCKUP_VB, lockupBody("bn-logo"), C("ink")));
writeFileSync(R("brand/logo/baitun-najat-mark.svg"), header + svg(MARK_VB, markBody("bn-mark"), C("ink")));

// Favicon: the mark in ink on the lime sun — ink is the one text colour lime takes.
const favicon = (pad) => {
  const s = 64, inner = s * (1 - 2 * pad), h = inner, w = h * MARK_VB[2] / MARK_VB[3];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}"><circle cx="32" cy="32" r="32" fill="${C("lime")}"/><svg x="${f((s - w) / 2)}" y="${f(s * pad - 1)}" width="${f(w)}" height="${f(h)}" viewBox="${MARK_VB.join(" ")}" fill="${C("ink")}">${markBody("fav")}</svg></svg>\n`;
};
writeFileSync(R("brand/logo/favicon.svg"), favicon(0.15));
// iOS rounds the corners itself, so the home-screen icon is a full lime square.
const touch = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><rect width="180" height="180" fill="${C("lime")}"/><svg x="${f((180 - 116 * MARK_VB[2] / MARK_VB[3]) / 2)}" y="30" width="${f(116 * MARK_VB[2] / MARK_VB[3])}" height="116" viewBox="${MARK_VB.join(" ")}" fill="${C("ink")}">${markBody("touch")}</svg></svg>`;
await sharp(Buffer.from(touch)).png().toFile(R("brand/logo/apple-touch-icon.png"));

// Site / asset macros. `id` must be unique on the page (it names the mask). With a label the
// SVG is an image; without one it is decoration beside text that already says the name.
const macro = (name, vb, body) => `{% macro ${name}(id, cls="", label=null) %}<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(" ")}" fill="currentColor" class="{{ cls }}" {% if label %}role="img" aria-label="{{ label }}"{% else %}aria-hidden="true" focusable="false"{% endif %}>${body("{{ id }}")}</svg>{% endmacro %}`;
writeFileSync(R("src/_includes/macros/logo.njk"),
  `{# Baitun Najat logo as inline SVG, in currentColor. Generated by scripts/logo.mjs — edit there, not here. #}\n` +
  macro("mark", MARK_VB, markBody) + "\n" + macro("lockup", LOCKUP_VB, lockupBody) + "\n");

console.log("  circle fits (poster ×10 units; 10 = 1 poster px):\n    " + fits.join("\n    "));
console.log(`✓ logo  lockup viewBox ${LOCKUP_VB.join(" ")}  mark viewBox ${MARK_VB.join(" ")}`);
console.log("  brand/logo/{baitun-najat-logo,baitun-najat-mark,favicon}.svg, apple-touch-icon.png, src/_includes/macros/logo.njk");
