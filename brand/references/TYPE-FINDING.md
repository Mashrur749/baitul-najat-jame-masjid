# Typeface identification — Seerah 2026 artwork

## Short answer

**No. The font was not recovered, and it cannot be.**

The posters are flattened JPEGs. A raster image contains pixels, not font data —
identifying a typeface from one is a matching exercise, never an extraction. Recovering
the actual face needs one of:

- the layered source (`.ai` / `.psd` / `.cdr`), or
- the font file itself, or
- **the designer simply telling us** — one message, exact answer

## Two different problems

**1. The display lettering** (৩য় সীরাত প্রতিযোগিতা) is **custom hand-drawn**, not type.
No font reproduces it. It must be vectorised from the artwork into `brand/logo/` and
placed as SVG. Substituting any typeface produces a different mark.

**2. The body text** (prize tables, rules) is a real typeface, and that is identifiable.

## What the body face looks like

From `seerah-2026-banner.jpg` at 2560px: high stroke contrast, fine matra against thick
verticals, slightly condensed, traditional rather than modern.

Compared against eight Bangla families available on Google Fonts
(`node scripts/type-compare.mjs`, then `node scripts/type-shot.mjs`):

| Family | Verdict |
|---|---|
| **Hind Siliguri** — current body token | Low contrast, sturdy, modern. **Not a match.** |
| Noto Sans Bengali | Low contrast, wide. No. |
| Baloo Da 2 | Rounded, heavy. No. |
| Mina | Light, wide. No. |
| Galada | Strongly calligraphic, near-italic. Too decorative. |
| **Noto Serif Bengali** — current display token | Moderate contrast. Closer, still not it. |
| **Atma** | Closest available on contrast and calligraphic feel. |
| **Tiro Bangla** | Also close; more traditional, less condensed. |

**Most likely the real answer: SolaimanLipi, or possibly Kalpurush.** Both are the default
Bangla faces in Bangladeshi design work, both have exactly this high-contrast fine-matra
character, and **neither is on Google Fonts**, which is why nothing here matches cleanly.
They are freely available but must be vendored manually.

## Recommendation

Ask the designer which font they used. It is one question and ends the guessing.

Until then the current tokens stand: Hind Siliguri for body, Noto Serif Bengali for
headings. They are legible, well-hinted and free — they are simply not the poster's type,
and this file exists so that is not mistaken for a decision.
