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
PRD.md          product requirements
```

To rebuild after editing `src.html`:

```bash
python3 prototype/build.py
```
