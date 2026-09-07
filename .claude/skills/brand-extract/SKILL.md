---
name: brand-extract
description: Turn reference images in brand/references/ into a proposed brand — palette, type, motif — and write it into brand/tokens.json. Use when starting the brand, when new references are added, or when the user asks to redo/refresh the visual direction from references.
---

# Extract a brand from references

Turns raw reference material into `brand/tokens.json`. Runs in four passes. Do not skip
to pass 3 — the value is in naming what you see before deciding anything.

## Pass 1 — Look, don't decide

Read **every** image in `brand/references/` with the Read tool. For each, write two lines:

- **What is actually there:** dominant hues (name the hex you'd sample), type
  classification, geometry, materials, how much empty space.
- **What it feels like:** three adjectives, no more.

Treat `reject-*` files as hard negative constraints — they narrow the space faster than
the positives. Photographs of the building itself outrank inspiration images: a palette
drawn from the real carpet and tilework produces a brand that feels true rather than
generic. Say so if the building photos are missing, and ask for them.

## Pass 2 — Find the through-line

Across all references, identify:
- The 2–3 colours that keep recurring (and one that recurs but *shouldn't* — the cliché).
- Whether the type wants to be serif or sans, and why, in one sentence.
- The single geometric motif with the most equity.
- What is genuinely distinctive vs. what is just "mosque default" (flat green, gold
  gradients, dome silhouettes, Photoshop lens flare). Name the defaults so we can avoid them.

Fill in the reference log table in `brand/BRAND.md` §3 — for each reference, what we
**take** and what we explicitly **reject**. This is what keeps inspiration from becoming
imitation.

## Pass 3 — Propose, with reasoning

Propose the palette and type. For each token, one line of justification tied to a specific
reference. Then **check the constraints before presenting**:

- Body text on its background ≥ 4.5:1. Large text ≥ 3:1.
- Any colour that fails as body text gets marked accent-only in `colorRules`, like brass is now.
- Bangla and Arabic faces must exist for the chosen families. If not, pick again — a
  beautiful Latin face with no Bengali companion is not usable here.

Present 2–3 directions, not one. Give each a name and a one-line thesis. Let the user choose.

## Pass 4 — Write it in

Once a direction is chosen:
1. Update `brand/tokens.json`. Set `$meta.status` to `"DRAFT"` and bump `$meta.version`.
2. Fill the `use` field on every colour — it is what stops later misuse.
3. `npm run fonts` (type tokens changed → fonts must be re-vendored).
4. `npm run assets && npm run build`.
5. **Read the rendered PNGs back.** The palette that looked right as hex swatches is often
   wrong at poster scale. Report what changed and what you'd still adjust.
