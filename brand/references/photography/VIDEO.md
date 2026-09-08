# Video assessment — Seerah Competition 2026

Four WhatsApp clips reviewed. **The source files are not in the repo** — WhatsApp
compression is already baked in, so keep the originals off the phone if you can still
get them; anything re-sent through WhatsApp loses another generation.

## The hard constraint

All four are WhatsApp-compressed to **≤850px on the long edge** at ~1.4 Mbit/s, shot at
59 fps. That is sub-SD. It rules out full-width video heroes at desktop size, and rules
in: scrimmed background loops, constrained-width embeds, and phone-first social clips.

The 59 fps is wasted — it spreads a thin bitrate across twice the frames anyone perceives.
Re-encoding to 25–30 fps gives the encoder roughly double the bits per frame and visibly
cleans the picture up. That single change does more than any upscaling.

## Clip by clip

| | Format | Content | Verdict |
|---|---|---|---|
| **v1** `…13.31.04` 33s | **848×478 landscape** | Walking shot through the boys' section. Rows of small children writing, volunteers in hi-vis distributing papers. | **Best of the four.** The only landscape clip, so the only web-hero candidate. |
| **v2** `…13.30.26` 87s | 478×850 portrait | Sustained close-up interview with one boy, seated with his answer sheet. | **Conditional** — see below. |
| **v3** `…13.31.02` 98s | 478×850 portrait | Walking tour past older participants; wide views of the full hall. | **Good.** Best scale coverage. Social-native. |
| **v4** `…09.46.55` 50s | 478×850 portrait | Behind the scenes: volunteers unpacking crests, dressing the stage, hanging the banner. Empty hall. | **Niche but valuable** — see below. |

### v1 — use 09.5s → 19.5s
The first ~8 seconds are blocked by a man in white in the foreground, and from ~20s a
figure in tan repeatedly crosses the lens. The middle ten seconds are the clean stretch:
camera mid-hall, children clearly readable, a volunteer bending to help in frame.

Processed and committed as `dist/video/out/hero-loop.mp4` — 10s, silent, 25 fps, denoised,
CRF 29, **1.3 MB**, with `hero-poster.jpg` alongside.

```
ffmpeg -ss 9.5 -t 10 -i v1.mp4 \
  -vf "hqdn3d=3:3:6:6,fps=25" -an \
  -c:v libx264 -profile:v high -crf 29 -preset slow -pix_fmt yuv420p \
  -movflags +faststart hero-loop.mp4
```

`-an` is deliberate: a hero loop must never carry audio. Denoise before the fps drop —
it lifts the WhatsApp blocking that would otherwise be sharpened into visible mush.

**VP9/WebM is not worth adding.** At this resolution it encoded *larger* than H.264 at
matched quality (2.3 MB vs 1.0 MB). Ship the MP4 only.

### v2 — the interview. Two blockers, one of them yours to judge
Audio is healthy: mean −18.1 dBFS against −24.3 for the ambient walking clips, so a
near-field voice is clearly dominating, not drowning in hall noise.

**I cannot tell you whether what he says is any good** — I can measure the audio, not
understand it. Somebody needs to listen and pull the two or three strongest sentences.

The second blocker is consent. This is 87 seconds of one identifiable child in tight
close-up, and it is aimed at funders. That needs explicit parental permission, in writing,
before it goes anywhere public — a higher bar than the group photographs.

If both clear, cut it to **8–15 seconds**, subtitle it in Bangla (phone audio in a hall
will not survive a funder scrolling with sound off), and treat it as a pull-quote rather
than a video. Framing is close and low-angle throughout, so crop to a chest-up 1:1 or 4:5
rather than using the full portrait frame.

### v3 — best scale coverage, keep it vertical
Sample around 0–12s and 55–70s: steadiest walking, widest hall views, least motion blur.
Do **not** letterbox this into a landscape slot — it is 478×850 and belongs as a
Facebook/Instagram story or reel at 1080×1920, where a modest upscale is invisible on a
phone. Same recipe as v1: 25–30 fps, `hqdn3d`, CRF 28–30.

### v4 — small, but it answers the donor's actual question
Visually the weakest: dim, cluttered, empty room. But frames around 8–20s show volunteers
unpacking the crests and trophies from bags — literally the thing donations bought. That
is worth more to a funder than another wide shot of a crowd.

Use it as a **short cutaway inside a longer edit**, not as a standalone clip. Or better:
pull two or three high-quality **stills** from it — `ffmpeg -ss 12 -i v4.mp4 -frames:v 1
-q:v 2 crest.jpg` — and use them as photographs in a "where the money goes" section.

## Recommended order of effort

1. **Ship the v1 hero loop.** Done and ready; it only needs wiring into the page.
2. **Pull stills from v4** for a costs/prizes section. Cheap, high value.
3. **Cut a 30–45s summary reel** from v1 + v3 for Facebook, vertical, subtitled.
4. **The interview last** — it needs a listener and a consent form before it needs an editor.

## What would improve the next event most

One person with a phone told to hold each shot still for a slow count of five, shooting
**landscape** for the website and **vertical** for social, and — critically — transferring
files by cable, Drive or AirDrop rather than WhatsApp. That single change would raise the
footage from 480p to 1080p or 4K and cost nothing.

## 2026-09-08 — web encode and poster

The hero no longer autoplays blind: `preload="none"`, and a 6-line script starts it after
`load` only without reduced motion and only when `navigator.connection` reports 4g (or
nothing). Under `preload="metadata"` + `autoplay` Chromium fetched the whole 1.32 MB anyway.

```
ffmpeg -i hero-loop.mp4 -an -c:v libx264 -profile:v main -b:v 450k -maxrate 550k -bufsize 1M \
  -preset slow -pix_fmt yuv420p -movflags +faststart hero-loop-web.mp4     # 848×478, ~570 KB
ffmpeg -i hero-loop-web.mp4 -frames:v 1 -q:v 4 hero-poster.jpg              # poster IS frame 0
```

350 kbps was tried and rejected: visible macroblocking on the children's white kurtas in
the desktop 4/5 crop. The loop point is still a hard cut (last→first frame SSIM 0.24); a
600 ms xfade from this second-generation encode ghosts the hi-vis vests, so do that only
from the v1 source above.
