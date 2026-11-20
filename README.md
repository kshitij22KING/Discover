# Coy Discover

Swipe-based "Discover" tab for the Coy SDE intern assignment. Next.js (App Router) + API routes, JSON-file persistence, no external dependencies beyond Next/React.

## Run

```bash
npm install
npm run dev      # http://localhost:3000  (open in mobile view for drag gestures)
npm test         # backend unit tests
```

Swipes and matches persist in `data/db.json` (created on first request, git-ignored).
Use "Reset demo data" on the empty screen (or `POST /api/reset`) to start over.

## API

| Route | Description |
|---|---|
| `GET /api/feed` | Profiles not yet swiped on |
| `POST /api/swipe` `{profileId, action: "like"\|"pass"}` | Records swipe → `{ match: boolean, profile? }` |
| `GET /api/matches` | Mutual matches, newest first |

## Privacy design (Coy's core promise)

- Each seeded profile has a server-only `likesYou` flag. Every response goes through `publicProfile()`, which strips it, so there is no endpoint or payload that reveals who liked you.
- A match is only created when you like someone **and** they already liked you. Passing never reveals anything.
- Each profile can be swiped once; repeats return `409`. This blocks "pass, then re-like" probing and guarantees a swiped profile never returns to the feed.
- Seed order is shuffled so likers are not predictable by feed position.
- The only observable signal is the match screen itself, which is mutual by definition.

## Layout

- `lib/logic.js` pure feed/swipe/match logic (unit tested), `lib/db.js` JSON persistence, `lib/seed.js` 36 mock profiles (12 already like you)
- `components/` swipe card (pointer-event drag), Discover (swipe + matches views, match modal)
- Desktop: ← / → keys or the buttons. Mobile: drag the card.
