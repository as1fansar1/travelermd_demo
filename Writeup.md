# Group wishlist for Lisbon: write-up

**Prototype:** https://claude.ai/artifact/Ro4xB96NhXFBvdWSFi1eg1 · **Code:** https://github.com/as1fansar1/travelermd_demo

**Competitive scan**
- **Borrow (Expedia):** "Compare stays" puts all saved stays side by side. I build the rows from what matters on this trip.
- **Weak (Booking.com):** One tap on the heart deletes a stay, and a shared list doesn't show who's on it.

**Product judgment**
- **Main user: Alex, the organizer.** The job is to get four friends to agree on one stay without chasing them. Alex sees every total against the budget and who is happy with which stay.
- **Biggest tradeoff: "happy with", not "favourite".** Friends tap every stay that works for them. That shows the overlap (Sam picked Central but is fine with Garden) where a favourite vote would deadlock.
- **Test first: is starting from preferences worth the extra step?** With 8–10 real organizers: if most skip "What matters this trip", I'd fill it in from traveler.md and remove the step.

**Time:** About [X] hours. Core journey plus visual polish. Mobile only. Imports, sharing and votes are simulated.
