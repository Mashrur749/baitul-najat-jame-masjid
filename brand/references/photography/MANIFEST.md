# Event photography — Seerah Competition 2026

Ten photos received from the masjid. **The files are not yet in the repo** — save them
into `src/images/event-2026/` under these exact names and the homepage picks them up.
Placeholders of the right shape are committed so the layout can be checked meanwhile.

## Competition day — the strong set

These are the persuasive ones. They show the activity itself rather than a stage.

| Filename | What it shows | Job |
|---|---|---|
| `exam-hall-wide.jpg` | ~40+ children writing on the floor in rows. Girls left, boys right. Pencil cases, clipboards, volunteers moving between rows. | **Hero.** Scale, and unmistakably a children's event. |
| `volunteer-helping-girl.jpg` | Badged volunteer in a hi-vis vest kneeling beside a small girl in white hijab, helping with her paper. | **The emotional anchor.** Warmth and individual care, not just logistics. |
| `exam-girls-rows.jpg` | Girls in white and coloured hijabs writing, volunteer assisting, mihrab behind. | Girls' participation — a significant signal on its own. |
| `volunteer-assisting.jpg` | Volunteer in white kurta helping several girls with their papers. | Supervision quality. |
| `papers-distribution.jpg` | Boys seated as volunteers hand out manila envelopes. Vest logo legible. | Organised process — a run event, not an improvised one. |
| `exam-mihrab-view.jpg` | Exam under way, mihrab and digital prayer clock visible. | Context: this happens in the masjid itself. |

## Prize ceremony

| Filename | What it shows | Job |
|---|---|---|
| `hall-packed.jpg` | Ceremony from the back. Floor full, ~150–200 seated. | Community turnout. |
| `stage-dignitaries.jpg` | Eight guests at a flower-dressed table, speaker at the podium, banner legible. | Institutional credibility. |
| `ceremony-audience.jpg` | Stage and audience together, banner readable. | Alternate ceremony frame. |
| `hall-wide.jpg` | Widest view of the packed hall. | Section break / gallery. |

## Banner record (`stage-dignitaries.jpg`)

**পুরস্কার বিতরণী ও আলোচনা সভা** · ২৯ আগস্ট ২০২৬ ঈসায়ী, শনিবার, বাদ আসর
আয়োজনে: বায়তুন নাযাত জামে মসজিদ

Guests named on the banner. **Titles are not transcribed** — the sub-lines are too small
to read reliably, and getting a scholar's or an academic's affiliation wrong is worse than
omitting it. Confirm with the imam before publishing:

- মাওলানা শাহ মমশাদ আহমদ
- প্রফেসর মুহাঃ হায়াতুল ইসলাম আকঞ্জি
- মুফতি জিয়াউর রহমান
- সভাপতিত্ব: জনাব দিদার আহমদ

## Romanisation — now three variants, two of them yours

- Event banner logo: **BAYTUN NAJAT**
- Volunteer vest logo: **BAITUN NAJAT**
- This repo / assumed domain: **baitul-najat**
- Bangla: **বায়তুন নাযাত**

Both English forms are already printed on physical items. Settle this before the site goes
live — it is the name a donor will type, search and write on a cheque.

## Consent — granted 2026-09-08

The committee, via the site owner, confirmed consent for the children in the held frames
on 2026-09-08. All three are published again: the looping clip is back as the hero,
`papers-distribution.jpg` is in the competition strip, and the gallery is four frames.
Keep the written forms with the committee's records; this file is the audit trail of
what was held, why, and when it was released.

### Review of 2026-09-07 (kept for the record)

No written consent is on file, so the site publishes only frames in which no child is
identifiable. Reviewed at full size, one by one:

| File | Verdict | Why |
|---|---|---|
| `exam-hall-wide.jpg` | **published — hero** | Wide; faces ~20px, nobody identifiable. |
| `volunteer-helping-girl.jpg` | published | Girl's face turned to the paper and covered by the hijab. Adult is a badged volunteer. |
| `volunteer-two-boys-portrait.jpg` | published | Both boys from behind. |
| `volunteer-assisting.jpg` | published | Girls face the paper; nothing frontal. |
| `exam-girls-rows.jpg`, `exam-mihrab-view.jpg` | published | From behind / wide. |
| `hall-packed.jpg`, `hall-wide.jpg`, `ceremony-audience.jpg` | published | Audience from behind. |
| `stage-dignitaries.jpg` | published | Named public guests at a podium. |
| `papers-distribution.jpg` | **held** | Two boys' faces frontal and recognisable at medium distance; a crop did not remove them. |
| `hero-loop.mp4`, `hero-poster.jpg` | **held** | Clip frames show children's faces at medium size, and the hero crop enlarges them. |

Held files lived in `brand/references/photography/held/`, outside the publish path,
until consent was granted (above). Should consent ever be withdrawn, that folder and the
commit "Vectorise the lettering, close the type question, hold unconsented photos" show
exactly how to take them down again.

### Original note

`BRAND.md` §3 requires written consent for photographs of congregants. Several of these
show **children's faces close up and clearly identifiable** — particularly
`volunteer-helping-girl.jpg`, which is also the most affecting image in the set.

Options, in order of preference:
1. Get written parental consent for the two or three close-up frames. Worth doing — they
   are the images that make a funder feel something.
2. Publish only the wide frames (`exam-hall-wide`, `hall-packed`, `hall-wide`), where no
   individual is identifiable. The scale story survives intact; the warmth does not.
3. Crop the close-ups to hands, papers and vests. Keeps the care, loses the faces.

Do not default to publishing children's faces because the photos were supplied.

## Note on `exam-hall-wide.jpg`

Currently a **tonal stub**, not the striped placeholder — it approximates the real photo's
brightness range so the hero scrim could be tested honestly (the flat placeholders are
light-on-light and would let an illegible scrim pass review). Regenerate with
`node scripts/tonal-stub.mjs` after any hero change; overwrite with the real photo when it
arrives.
