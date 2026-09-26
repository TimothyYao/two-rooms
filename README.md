# Two Flocks

Mobile role dealer for **Two Rooms and a Boom**, themed as sheep & wolves.

## Play

1. Everyone opens the same URL and enters their name.
2. **Tim** (hardcoded host) configures the deck, then starts the game.
3. Each player sees only their own role. Open **Rules** for round / hostage help.
4. Physical rooms, leaders, and swaps stay in real life — this app deals roles.

## Rename roles later

- Mechanical IDs stay in `src/lib/roles/catalog.ts` (e.g. `president`, `bomber`).
- Display names & instructions live in `src/lib/roles/theme.ts` only.
- Swap or edit the theme file to retheme without touching game logic.

## Deck sizing

Default decks follow Tuesday Knight Games playset player-count gates:

| Players | Specials |
|--------:|----------|
| 6–10 | President, Bomber, team fillers, Gambler if odd |
| 11+ | + Doctor/Engineer, Coy, Spy, Negotiator |
| 12+ | + Werewolves, Survivor, Victim, Intern, Rival; MI6 if odd |
| 16+ / 18+ / 20+ | + Angel / Mime / Paparazzo pairs |

Tim can exclude roles and pick alternates or keep minimal team fillers.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Role avatars

Muse character pack lives in `public/avatars/`:
- `stills/*.webp` — posters
- `animations/*-idle.webm` — looping idle clips

Mapping is in `src/lib/roles/avatars.ts`. Temporary stand-ins until dedicated art exists:
- Fortune Teller → `black-sheep`
- Village Watch → `shepherd`
- Marked → `werewolf`
- Generic pack Wolf → `wolf` (same as The Wolf)

## Persistence (Vercel)

Game state uses **Upstash Redis** (free tier) or **Vercel KV** when these env vars are set:

- `KV_REST_API_URL` + `KV_REST_API_TOKEN` (Vercel Storage → KV), **or**
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (upstash.com)

Without them, the app falls back to in-memory state (local `npm run dev` still works).

## Scripts

```bash
node --experimental-strip-types scripts/check-deck.mts
```
