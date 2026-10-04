# PRD: Group wishlist

**Traveler.md** · Draft v0.4 · Oct 4, 2026 · Asif Ansari
[Prototype](https://claude.ai/artifact/Ro4xB96NhXFBvdWSFi1eg1) · [Code](https://github.com/as1fansar1/travelermd_demo)

## Problem

Groups compare stays across Airbnb, Booking.com and Expedia using tabs, screenshots and group chats. Three things go wrong:

- Each site's wishlist holds only that site's listings.
- Prices aren't comparable, because some exclude mandatory fees.
- The organizer ends up chasing people for votes.

## Bet

The wishlist is the shortlist stage of `trip.md`, not a new object. Stays from any site land in one list with honest totals. The group decides by tapping every stay they'd be happy with. The decision is written to trip.md, where every connected AI tool can read it.

## Users

- **Organizer (primary):** Alex. Collects stays, gets the group to a decision, and books.
- **Co-travelers:** open a link from the group chat. No account, under a minute.
- **Connected tools:** Claude, ChatGPT and other MCP clients read the result.

## Principles

1. **Memory adds notes but never ranks.** The organizer's preferences flag what to check and cite their evidence. They never hide or reorder a stay, because the decision belongs to the group.
2. **Honest prices.** Show totals that include fees. When a fee is unknown, show "base + fee" and the largest fee that still fits the budget. Never estimate the fee, and never label that stay cheapest.
3. **Nothing shared by default.** Co-travelers see listings and votes, never the organizer's traveler.md.
4. **Corrections go to the right file.** A change that holds only for this trip saves to trip.md instantly, with undo. A change to traveler.md shows a diff and needs confirmation.

## Requirements

P0 unless marked.

| Area | Requirement |
|---|---|
| Start | The wishlist inherits dates, guests, rooms and budget from trip.md. The organizer marks each saved preference *Matters* or *Not this trip*. The section collapses once set. |
| Save | Paste a link from Airbnb, Booking.com or Expedia. The import reads the total for the trip, checks the stay fits, and flags a missing fee. |
| Review | Cards show the total against the budget, key facts, and a link to the listing with the trip's dates and guests filled in. Removing a stay leaves a Restore row. A Compare view (P1). |
| Memory | A private line on each card shows match, conflict or unknown, with the evidence. Actions: *Not this trip*, *Wrong for this stay*, *Edit*, *Forget*. |
| Decide | A no-login link that expires and can be turned off. Friends tap every stay they'd be happy with and can share what matters to them. The organizer sees who has opened and voted (P1). |
| Dealbreakers | Before the organizer chooses a stay, flag any friend who skipped it and shared a preference it doesn't meet. A tie names the tradeoff (quiet vs. central). |
| Close | Write the choice to trip.md, move the status to Booking, post the result to the chat (P1), and send the organizer to the provider to book. |

**Out of scope:** booking, payments, live prices, ranking inventory, upsells, comment threads, desktop.

## Output: trip.md

```markdown
## What matters this trip
- Quiet at night: matters to Alex and Jordan.
- Walk to cafés and the centre: matters to Sam.

## Accommodation
- Chosen: Garden Apartment (Airbnb), €1,080 incl. fees. 3 of 4 happy.
- Backup: Riverside Flat (Expedia), €990 + unknown fee (fits if ≤ €210).
```

## Metrics

- **North star:** shared wishlists that reach a decision within 72 hours. Target 50%.
- **Start step:** organizers who set "What matters this trip" instead of skipping it. Target 50%.
- **Inputs:**
  - friends who vote within 24 hours
  - wishlists with stays from 2 or more providers
- **Guardrails:**
  - imported totals that don't match the provider's checkout: under 2%
  - one person's preferences shown to someone else: never

## Riskiest assumptions

1. **Starting from preferences is worth the extra step.** Test with 8–10 organizers. If most skip "What matters this trip", fill it in from traveler.md and remove the step.
2. **Approval voting picks a winner.** If most groups tap every stay or end in a tie, add a "can't do this one" option.
3. **Friends vote through a link.** If fewer than half vote within 24 hours, move voting into the chat as a poll.

## Open questions

- **Who owns a group trip.md?** Proposal: the organizer, with time-limited access for the others.
- **Listing data:** partner APIs, or paste the link and confirm the details?
- **Price drift:** prices change after saving, so check them again before the vote closes.
