---
name: brand-review
description: Audit rendered assets and site pages against the brand system — consistency, contrast, typography, token drift. Use before a print run, before a campaign ships, or when things have started looking inconsistent.
---

# Brand review

An audit of what actually renders, not what the code says.

## 1. Token drift — the machine check

```bash
grep -rnE '#[0-9a-fA-F]{6}' src assets-src --include='*.njk' --include='*.css' \
  | grep -v tokens.generated
grep -rnE 'font-family:\s*["'\'']' src assets-src --include='*.njk'
```

Any hit is a leak: a value that will not follow the brand when tokens change. Report each
with its file and line, and move it into `brand/tokens.json`.

## 2. Render everything, then look

```bash
npm run assets && npm run build
node scripts/shoot.mjs _site/index.html dist/screens/home.png
```

Read every PNG in `dist/assets/` and `dist/screens/`. Judge them **as a set**, side by
side — individual assets can each be fine while the set is incoherent.

- Do these look like one organisation? Where does the family resemblance break?
- Is the wordmark treated identically everywhere — same weight, same clear space?
- Is the motif at consistent scale and opacity, or drifting per asset?
- Is brass confined to accent work in all of them?

## 3. Contrast

For every text/background pair in `tokens.color`, compute the ratio. Report anything under
4.5:1 used as body text or under 3:1 as large text or UI. `tokens.colorRules.minContrast`
holds the thresholds. This is not optional on a community site — a chunk of the
congregation is elderly and reading prayer times on a phone in a bright hallway.

## 4. Script rendering

Confirm Bangla renders in Noto Sans Bengali and Arabic in Amiri, in every asset that
contains them. A silent fallback to a Latin face is the most common failure and the
hardest to spot without looking. Check that Arabic is right-aligned and that no Quranic
text sits under a gradient, rotation, or overlay.

## Report

Group findings: **must fix before print** / **should fix** / **noted**. For each, name the
file and the specific token or line. Do not pad the list — three real findings beat twelve
speculative ones.
