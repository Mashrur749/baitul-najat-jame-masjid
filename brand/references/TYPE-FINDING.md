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

## Decision — 2026-09-07

**The poster's body face is not adopted, and the question is closed.**

Reasoning:

1. The identity is carried by the hand-lettering, not the text face. That lettering is now
   vectorised (`brand/logo/seerah-2026-lettering.svg`) and used on the site and the share
   card, so the mark people recognise from the banner is already the same mark on screen.
2. A high-contrast, fine-matra face is the wrong tool for the screen. Thin matras break up
   at 16–18px on the phones this congregation reads on, and BRAND.md's own note is that
   elderly readers must be able to read this in a bright hallway. Hind Siliguri is
   low-contrast and well-hinted for exactly that job.
3. Of the candidates, Tiro Bangla ships only a Regular and Atma is too decorative for a
   masjid. Neither replaces Noto Serif Bengali 700/800 for headings.

So: **Hind Siliguri body, Noto Serif Bengali display, hand-lettering as the mark.** Print
pieces produced by the original designer may keep their own text face; that is their
tool, not a brand rule. If the designer ever names the font, record it here as a fact —
it does not reopen the decision.
