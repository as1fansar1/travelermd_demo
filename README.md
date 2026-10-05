# Traveler.md: group wishlist demo

A clickable mobile prototype of a group wishlist for a Lisbon trip: four friends, three stays from three booking sites, one decision.

- **Live prototype:** https://claude.ai/artifact/Ro4xB96NhXFBvdWSFi1eg1
- **PRD:** [PRD.md](PRD.md)

## The idea

The wishlist is the shortlist stage of the trip's `trip.md`, not a separate list:

1. Alex marks which saved preferences matter for this trip.
2. Alex pastes links from Airbnb, Booking.com and Expedia into one list.
3. Friends tap every stay they'd be happy with.
4. The decision is written back to trip.md, where Claude, ChatGPT and other connected tools can read it.

Alex's memory adds notes to each stay but never ranks them.

## Try it

Open the live link, or run it locally:

```bash
python3 -m http.server 8765 --directory prototype
```

Then visit http://localhost:8765. Use the left rail to jump between steps, and switch "Viewing as" to Riley to see the friend's view.

Imports, sharing, votes and booking are simulated. There is no backend.

## Structure

```
prototype/
  src.html      the app: vanilla JS, one file, no dependencies
  images/       stay photos, provider logos, traveler avatars
  build.py      inlines images and writes index.html and artifact.html
  index.html    built standalone page
promo/
  stage.js      42s promo timeline that drives the real prototype UI
  stage.css     promo styling
  build.py      writes promo.html from the built prototype
  render.mjs    renders promo.html to MP4 (Playwright + ffmpeg)
  score.py      original score and sound design, synthesized (numpy + scipy)
  poster.png    end-card still
PRD.md          product requirements
```

To render the promo video (needs Playwright and ffmpeg):

```bash
python3 promo/build.py && node promo/render.mjs && python3 promo/score.py
```

Then mux the score into the video:

```bash
ffmpeg -i promo/traveler-wishlist-promo.mp4 -i promo/score.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5 -c:a aac -b:a 256k -shortest promo/promo-with-music.mp4
```

To rebuild after editing `src.html`:

```bash
python3 prototype/build.py
```
