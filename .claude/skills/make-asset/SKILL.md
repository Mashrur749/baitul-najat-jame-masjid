---
name: make-asset
description: Create a new marketing asset — poster, social post, flyer, banner, lobby screen, OG image — from the brand system. Use when asked for any printed or social graphic for the masjid.
---

# Make a marketing asset

## Before writing anything

1. Read `brand/BRAND.md` §2 (visual principles and hard rules).
2. Check `tokens.artboard` for the right size. Add one to the tokens if it's genuinely new
   — do not hardcode dimensions in a template.
3. Look at `assets-src/` — **reuse an existing template** if the content shape fits. A new
   `.njk` is justified by a new *layout*, not new *words*.

## Write

- Content goes in `assets-src/content/<name>.json`. Templates hold no copy.
- Compose from `macros/brand.njk` — `wordmark`, `motif`, `rule`, `bilingual`, `arabic`,
  `prayerTable`. Do not re-implement these.
- One message per asset. If it has two headlines it is two assets.
- Bangla alongside English wherever the audience is the congregation.
- No literal hex, font stack, or px dimension. Tokens only.

## Copy

Read it aloud. If it wouldn't sound right said kindly to a stranger at the door, rewrite
it. Facts — times, dates, addresses, amounts — must be exact or marked `⟨TBD⟩`. Never
invent a time, a price, or an imam's name; leave the placeholder visible so it cannot ship
by accident.

## Render and check

```bash
npm run assets                              # or: npm run render <name>
node scripts/render.mjs <name> --format pdf # print
```

Then **Read `dist/assets/<name>.png` back and critique it before reporting done.** Check:

- Does it survive a 3-metre / thumbnail read? Squint — is the hierarchy still there?
- Any text clipped or overflowing the artboard?
- Dead space — does it read as breathing room or as a bug? Pooled slack in one gap reads
  as a bug; distributed slack reads as intentional.
- Are Bangla and Arabic in their proper faces, or has something fallen back to Latin?
- Is brass doing accent work only?
- Is the motif supporting the type or competing with it?

Fix what you find, re-render, look again. Report honestly what you'd still change.
