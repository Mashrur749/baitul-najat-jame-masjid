# What's left — Baitun Najat website

Live at https://baitunnajat.hikmahedu.com. Everything below is either **waiting on
information** from the committee or **a one-time setup step** only the site owner can do.
Nothing here is broken on the live site: each missing item shows a visible "TBD", falls back
to the committed data, or simply doesn't render until it's supplied.

Last updated: 2026-09-15.

---

## 1. Site owner — setup steps (you)

### 1.1 Let the site rebuild itself every 3 hours
The change is ready locally in `.github/workflows/deploy.yml` (a `schedule:` trigger) but
can't be pushed: GitHub requires the `workflow` permission to change workflow files.

- [ ] In this session's terminal run: `! gh auth refresh -h github.com -s workflow`
- [ ] Then ask Claude to push the pending `deploy.yml` change.

**Why it matters:** without it, prayer-time and event edits in the sheet only go live on the
next code push or when an admin presses "এখনই আপডেট করুন" (see 1.3).

### 1.2 Turn the admin workbook into the live Google Sheet
The workbook "বায়তুন নাযাত — ওয়েবসাইট তথ্য (অ্যাডমিন)" (tabs: আয়োজন, নামাজের সময়,
নির্দেশনা) was uploaded to your Google Drive as an `.xlsx`.

- [ ] Open it in Drive → **File → Save as Google Sheets**. Work in the new copy from now on.
- [ ] **Share → General access → Anyone with the link: Viewer** (the site reads it at build time).
- [ ] Add the masjid admins as **Editors**.
- [ ] Open the **আয়োজন** tab, copy the browser URL; do the same for **নামাজের সময়**.
      Send both links to Claude (or paste them into `src/_data/site.json` as `eventsSheetCsv`
      and `prayerSheetCsv` — a normal sheet link with the tab open works).
- [ ] After the next deploy, open https://baitunnajat.hikmahedu.com/status/ and check every row
      shows as live (the page explains any row that isn't).

**Until then:** events come from the committed `src/_data/activities.csv`; prayer times are
not shown at all (placeholder times must never go live again — see CLAUDE.md).

### 1.3 Install the "ওয়েবসাইট" menu in the sheet
Gives admins an **এখনই আপডেট করুন** (publish now) button and a **স্ট্যাটাস দেখুন** link.

- [ ] In the Google Sheet: **Extensions → Apps Script**, replace the contents with
      `tools/sheet-menu.gs`, Save.
- [ ] Create a **fine-grained GitHub token**: repository access = *only*
      `Mashrur749/baitul-najat-jame-masjid`; permissions = *only* **Actions: Read and write**.
- [ ] Apps Script → **Project Settings → Script properties → Add** `GITHUB_TOKEN` = that token.
      Never put the token in the sheet itself or in this repository.
- [ ] Reload the sheet, run **ওয়েবসাইট → এখনই আপডেট করুন** once and approve the permissions.

### 1.4 Refresh link previews on Facebook
Facebook caches old preview images. After any change to a share card:
- [ ] Paste the page URL into the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
      and press **Scrape Again** (home, `/services/`, `/ansar/`, `/events/seerah-2026/`).

---

## 2. Committee — information the site is waiting for

| # | Item | Where it goes | Shows now |
|---|------|---------------|-----------|
| 2.1 | **bKash number for general donations**, and whether it is a **Merchant** (donor picks *Payment*) or **Personal** (donor picks *Send Money*) number. Must be a dedicated masjid account — it is published. A wrong type loses the transaction. | `site.json` → `donation.bkash` (`/donate/`) and `event.json` → bKash (`/events/seerah-2026/`) | "TBD" card with the imam's phone |
| 2.2 | **Najat TV links** — YouTube channel and Facebook page URLs. | `site.json` → `social.youtube`, `social.facebook` | No watch buttons on `/media/` |
| 2.3 | **Calligraphy course start date.** The sheet says 1 October 2026, which is a **Thursday**, but classes run on Fridays and Saturdays. Confirm the real first class (likely Fri 2 Oct). | The আয়োজন tab in the sheet (or `activities.csv` until then) | "১–৩১ অক্টোবর ২০২৬" |
| 2.4 | **Original logo file** (AI, PDF, SVG or a large PNG) from whoever designed it. The current logo is a careful redraw from a ~110 px image on the poster; an original file replaces it. | `brand/logo/`, then retire `scripts/logo.mjs` | The redraw |
| 2.5 | **Logo wording:** keep **"JAME MOSQUE"** (as on the poster) or change to **"JAME MASJID"** (as used elsewhere on the site)? | One word in `scripts/logo.mjs` | JAME MOSQUE |

---

## 3. Committee — content that would make the site stronger

These aren't blocking anything, but they are the biggest remaining gains in impact.

- [ ] **Photos beyond the Seerah competition** — weekly halaqa, Qur'an class, iftar, relief
      distribution, medical camp, Eid. Every photo on the site today is from one event, which
      will start to look repetitive. **Any photo showing a child needs written consent**
      recorded in `brand/references/photography/MANIFEST.md` first. How to send them:
      `UPLOADING-PHOTOS.md`.
- [ ] **Two or three real quotes, with permission** — a parent, a young volunteer, a family the
      janazah or relief team helped. One sentence each, with name (or "a parent from
      Upashahar") and consent to publish. The site has no testimonials and won't invent any.
- [ ] **Committee-approved positioning sentence** (`brand/BRAND.md` §4). The site currently
      leads with the presentation's closing line: *"মানুষ যেন বলে — এই মসজিদ থাকলে সমাজ নিরাপদ।"*
      Confirm it, or supply the preferred wording.
- [ ] **Layered source artwork** (the designer's original files for the banner/poster) so the
      palette can be re-sampled exactly instead of by eye from flattened images
      (`brand/BRAND.md` §4).

---

## 4. Developer follow-ups (once the above arrives)

- [ ] 1.1 done → push `.github/workflows/deploy.yml` (3-hourly rebuild).
- [ ] 1.2 links arrive → set `eventsSheetCsv` / `prayerSheetCsv` in `site.json`, deploy, check
      `/status/`, and confirm the prayer block appears on the homepage.
- [ ] 2.1 → fill `donation.bkash` in `site.json` and the bKash block in `event.json`; remove the
      TBD notes.
- [ ] 2.2 → fill `social.youtube` / `social.facebook`.
- [ ] 2.4 / 2.5 → replace or adjust the logo, regenerate (`node scripts/logo.mjs`), re-render the
      share cards (`npm run assets`).
- [ ] Quotes arrive → add a testimonial band to the homepage (between services and Ansar) and
      to `/services/`.
- [ ] New photos arrive → record consent in `MANIFEST.md`, then give `/programs/`, `/services/`
      and the homepage their own images instead of the Seerah set.
- [ ] Remaining `brand/BRAND.md` §4 open decisions: assign the two greens permanently; re-sample
      the palette once layered artwork exists.
