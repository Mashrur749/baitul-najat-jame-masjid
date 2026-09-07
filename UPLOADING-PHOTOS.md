# Sending the event photos

## The important bit: attach files, don't paste images

Your videos arrived as real files I could open and process. The reference posters
you pasted inline did not — I could look at them, but they never touched the disk,
which is why the palette is still "sampled by eye" rather than measured.

**Use the attach/paperclip control, not copy-paste.** Pasted images can be looked at;
attached files can be resized, cropped, optimised and committed.

## Send the originals

Not the WhatsApp copies. The video assessment showed WhatsApp crushes files to 480p,
and it does the same to photos. Get them off the photographer's phone by cable,
Google Drive, or AirDrop — anything but WhatsApp.

A quick check: on a phone, open a photo and look at its info. If it says roughly
3000×4000 or larger you have the original. If it says 1600×1200 or smaller it has
already been through WhatsApp, and the detail is gone for good.

## Names

Send them in any order and tell me which is which, or rename them first to match
`brand/references/photography/MANIFEST.md`:

```
exam-hall-wide.jpg          ~40+ children writing, girls left, boys right   → hero
volunteer-helping-girl.jpg  volunteer kneeling beside a small girl
exam-girls-rows.jpg         girls in white hijabs writing, mihrab behind
volunteer-assisting.jpg     volunteer in white kurta helping several girls
papers-distribution.jpg     boys receiving manila envelopes
exam-mihrab-view.jpg        exam under way, mihrab and prayer clock visible
hall-packed.jpg             ceremony from the back, floor full
stage-dignitaries.jpg       eight guests at the flower-dressed table
ceremony-audience.jpg       stage and audience together
hall-wide.jpg               widest view of the packed hall
```

Renaming is optional. I can match them from the descriptions.

## What I do once they land

Resize to sensible web widths, compress, strip EXIF (phone photos carry GPS
coordinates of the masjid and the timestamp — that should not ship on a public page),
drop them into `src/images/event-2026/` over the placeholders, and re-render the page
so we can look at it together.

## If you'd rather use git

```bash
git clone https://github.com/Mashrur749/baitul-najat-jame-masjid
cd baitul-najat-jame-masjid
git checkout claude/brand-creation-visual-assets-5uca3a
# copy the photos into src/images/event-2026/ using the names above
git add src/images && git commit -m "Add event photography" && git push
```

Then tell me and I'll pull them.

## One more thing worth having

A **clear, straight-on photo of the event banner** — close enough to read the small
lines under each guest's name. That is the only way to get their titles right, and a
wrong affiliation on a mufti or a professor is worse than no title at all.
