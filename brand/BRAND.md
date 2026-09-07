# বায়তুন নাযাত জামে মসজিদ — Brand Core

Baytun Nazat Jame Masjid · ই. এফ. আই ব্লক, শাহজালাল উপশহর, সিলেট।

> **Status: DRAFT.** Palette and type are derived from the 3rd Seerah Competition 2026
> campaign — see `brand/references/EXTRACTION.md`. Items marked `⟨TBD⟩` need a committee
> decision. Colours were sampled by eye from delivered artwork; re-sample from the layered
> source once it is in `brand/references/`.

---

## 1. Language

**Bangla is the primary language.** English is secondary and optional — on most assets it
is absent entirely, and that is correct. This is not a bilingual brand with Bangla bolted
on; it is a Bangla brand that sometimes carries English.

- Bengali numerals (০১২৩৪৫৬৭৮৯) for all dates, times, prices and counts.
- Latin digits for phone numbers only — local convention, and the reference follows it.
- The `bn` filter handles both automatically; it detects phone numbers and leaves them be.

## 2. Colour contract

Measured, not asserted. Run `node scripts/contrast.mjs` after any change.

| Token | Job | Never |
|---|---|---|
| `lime` `#A5C332` | **Ground only.** Pills, icon discs, table headers, the sun disc. Always `ink` on top (7.07:1). | As text — 1.80:1 on paper |
| `olive-deep` `#5E6B2C` | **Ground only.** Section bands, contact blocks, footer. Always `paper` on top (5.19:1). | `ink` on it — 2.44:1 |
| `olive-mid` `#7E9333` | Large text only, ≥24px bold, on paper (3.07:1). Masjid name, headings. | Body copy |
| `ink` `#2B2B28` | Body and headings on paper (12.69:1) or lime (7.07:1). | — |
| `paper` `#F6F2E7` | Page ground; text on olive-deep. | Pure white anywhere |

The original designer's instincts already match this maths — every pill in the reference
artwork is black-on-lime, and lime is never set as type. The tokens encode what was
already being done correctly.

## 3. Visual principles

1. **Density is correct.** These posters are read closely, not glanced past. Do not
   "clean up" dense layouts into sparse Western minimalism — it reads colder, not better.
2. **The pill header is the structural device.** Rounded pill, icon, label. It carries
   dense content and the congregation already recognises it.
3. **Lime as a ground, never as ink.** See the contract above.
4. **Cream page, never white.**
5. **Two motif tiers.** Permanent (pill header, sun disc) is available to any asset.
   Campaign (desert, camels, palms, mosque line-art) belongs to Seerah/Hijra themes only
   and must never appear on prayer times or a donation appeal.

### Hard rules
- Never distort, rotate, recolour, or overlay text on Quranic text or the Bismillah.
- The campaign display lettering (৩য় সীরাত প্রতিযোগিতা) is **hand-drawn, not a typeface.**
  Vectorise it into `brand/logo/`. Substituting Noto Serif Bengali and calling it the same
  thing is not acceptable — it is a different mark.
- No photographs of congregants without written consent.
- Logo needs a defined minimum size and clear space — it is currently too small and gets
  lost, particularly on the landscape banner.

## 4. Open decisions

- [ ] **Romanisation of the name.** The logo says **BAYTUN NAZAT**; this repo and the
      assumed domain use **baitul-najat**; Bangla is **বায়তুন নাযাত**. Three different
      spellings in circulation. Pick one — it affects the domain, email, and every English
      asset.
- [ ] Positioning sentence, committee-approved.
- [ ] Re-sample the palette from layered source artwork rather than a flattened render.
- [ ] Vectorise the custom display lettering and the Team Seerah logo into `brand/logo/`.
- [ ] Assign the two greens permanently — the reference uses lime and olive
      interchangeably in places, which is the one real inconsistency in it.
