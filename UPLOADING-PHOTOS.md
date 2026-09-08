# Sending the event photos

## Correction: "attach vs paste" is not the distinction — file type is

My earlier advice was wrong. Your videos reached the disk and your photos did not,
and the reason is not how they were added. The client renders anything it recognises
as an image inline, however it is sent; files it cannot render — like `.mp4` — get
written to disk where they can actually be opened and processed.

So a `.jpg` sent any way at all can be looked at but not worked on.

## Two things that do work

### 1. Push from your computer (best, and you are already there)

See the commands below in "From your local machine".

### 2. Zip them

A `.zip` is not a renderable image, so it lands on disk like the videos did.

```
Select all 10 photos → compress → send photos.zip
```

On a phone: select the photos in Files/Photos, choose **Compress**, send the resulting
archive. That is the whole trick.

### 3. From your local machine

```bash
git clone https://github.com/Mashrur749/baitul-najat-jame-masjid
cd baitul-najat-jame-masjid
git checkout claude/brand-creation-visual-assets-5uca3a
# copy photos into src/images/event-2026/
git add src/images && git commit -m "Add event photography" && git push
```

Then tell me and I will pull them.

## Send the originals

Not WhatsApp copies. The video assessment showed WhatsApp crushes files to 480p and it
does the same to photos. Move them off the photographer's phone by cable, Google Drive
or AirDrop.

Quick check: open a photo's info on the phone. Roughly 3000×4000 or larger means you
have the original. 1600×1200 or smaller means it has already been through WhatsApp and
the detail is gone for good.

## Names

Rename to match `brand/references/photography/MANIFEST.md`, or send them in any order
and describe them — I can match them from the descriptions.

```
exam-hall-wide.jpg          ~40+ children writing, girls left, boys right   → hero
volunteer-helping-girl.jpg  volunteer kneeling beside a small girl
exam-girls-rows.jpg         girls in white hijabs writing, mihrab behind
volunteer-assisting.jpg     volunteer in white kurta helping several girls
papers-distribution.jpg     boys receiving manila envelopes   (held — faces; needs consent)
exam-mihrab-view.jpg        exam under way, mihrab and prayer clock visible
hall-packed.jpg             ceremony from the back, floor full
stage-dignitaries.jpg       eight guests at the flower-dressed table
ceremony-audience.jpg       stage and audience together
hall-wide.jpg               widest view of the packed hall
```

**Consent.** A photo that shows a child's face clearly is not published until a parent
has agreed in writing. The per-photo verdicts, and where held files live, are in
`brand/references/photography/MANIFEST.md`.

## What I do once they land

Resize to sensible web widths, compress, **strip EXIF** — phone photos carry the
masjid's GPS coordinates and timestamps, which should not ship on a public page —
place them over the placeholders, and re-render so we can review the real page.

## Still needed separately

A **straight-on close-up of the event banner**, readable enough to make out the small
lines under each guest's name. It is the only way to get their titles right.
