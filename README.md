# Pokémon Explorer

A browsable field index of all 1,025 Pokémon, built on the [PokéAPI](https://pokeapi.co/).
A React + TypeScript client, and an Express API that caches and indexes upstream data so
filtering and stat sorting run over the whole Pokédex rather than just the loaded page.

---

## Features

**Core**

- **Card grid** — artwork, name, dex number and types, with every card tinted by its
  primary type. Each card carries a "containment halo" in the type's hue and a two-tone
  rule across the top edge for dual types.
- **Search by name** with a 350 ms debounce, substring matching (`char` finds Charmander,
  Charmeleon and Charizard) and a `/` keyboard shortcut to focus the field.
- **Load more** — 24 Pokémon per page; nothing is loaded up front that isn't shown.
- **Detail view** — a right-hand drawer on desktop, a bottom sheet on mobile, holding
  large artwork, dex number, types, description, height, weight, base experience,
  segmented base-stat meters, abilities (hidden ones marked) and level-up moves.
- **Type filter** — all 18 types with live counts, filtered server-side across the
  entire Pokédex.
- **Responsive** — 1 / 2 / 3 / 4 columns from mobile to wide desktop.
- **Loading states** — skeleton cards that match the real card's geometry exactly, so
  nothing shifts when data arrives; a matching skeleton in the detail panel.
- **Error states** — distinct copy for a network failure, an unknown Pokémon and an
  upstream failure, each with a retry where retrying can help.
- **Empty state** — names the query that found nothing and offers a way back.

**Bonus**

- ⭐ **Favorites**, persisted to `localStorage`, with a favorites-only view.
- ⭐ **Dark mode**, following the system preference on first visit and remembered after.
  Applied before first paint, so a reload never flashes white.
- ⭐ **Sort** by dex number, name, HP, attack, defense or speed — across the full result
  set, not just the loaded page.
- ⭐ **Compare** — pick any two Pokémon and see their stats head to head, with the
  higher value in each row marked.
- ⭐ **URL-based detail** — `/pokemon/pikachu` opens directly and is shareable.
- ⭐ **Keyboard support** — `/` focuses search, `Esc` clears it and closes the drawer or
  dialog, `Tab` reaches every control, and cards are real links.
- ⭐ **Reduced motion** respected throughout.
- ⭐ **Four casings** — Poké, Great, Ultra and Master Ball, each recolouring the whole
  device. See below.

---

## The Device

The interface is not a page of cards on a background — it is a handheld Pokédex. The
background is the casing the shell is moulded from, and everything set into it is either
a moulded part or a lit screen: hard black outlines, flat offset shadows, no blur and no
glow in the chrome. Depth comes from the offsets, the way it does on moulded plastic.
Buttons travel *into* their own shadow when pressed rather than dimming.

Above the hinge ridge sits the bezel — the scanner lens, the three indicator LEDs and the
wordmark stamped into the casing.

Below the hinge the device **opens into two halves**, the way a Pokédex does: the
specimen on one side, the record on the other.

- **Left — the viewer.** The display is not a panel floating on the casing: it is set into
  a silver moulding with two lamps above it and speaker slits below, showing the selected
  Pokémon large under its own type halo and a faint scanline wash. Beneath the moulding
  sits the control cluster — the big round button that keeps a specimen, the lit green
  readout naming it, and a **D-pad that walks the index one entry at a time**. Then the
  search, sort and type controls, and the index itself as a scrolling list of rows. Rows
  rather than cards here: at this width a grid would fit two across and turn the whole
  half into artwork, which is the viewer's job.
- **Right — the record.** Opens with its own black display strip, then description,
  height, weight, base experience, the segmented base-stat meters, abilities and level-up
  moves.

The two halves are joined by the hinge spine — the barrel standing proud of both, lit down
one edge. Without it the halves read as two unrelated panels that happen to sit side by
side; with it they read as one object that opens.

The parts beyond the casing — the silver moulding, the black display strips, the lit green
readout, the blue keypad key on the sort toggle — are *hardware* colours. They stay put
across every ball, the way the physical parts would, so only the shell changes when you
switch casings.

Each half scrolls independently, so reading the record never scrolls the index away, and
selecting a row swaps the viewer and the record together. With nothing picked the device
falls back to the first row of the current result set, so it is never showing a blank
screen — the fallback is display-only and never rewrites the URL, so a shared
`/pokemon/pikachu` link still means exactly what it says.

Below 1024px the device closes: the index becomes the full-width card grid and the record
returns to a bottom sheet, since two halves will not fit side by side on a phone.

### Casings

Four balls, each carrying a *pair*: `casing` is the shell the device is moulded from,
`accent` is the secondary that every interactive part takes. The pairing is the point —
Great is blue with red, Ultra is black with gold — so a theme is never a single-hue tint.

The interior is tinted by the ball too, not left neutral — a black-and-gold Ultra shell
around plain grey panels reads as two unrelated designs. Each interior is tinted toward
the colour that *identifies* its ball, kept within a few percent of white so ink contrast
is untouched and only the temperature of the interior moves.

Two details make the system hold together:

- **`accentInk`** is the text colour on an accent fill — black on Ultra's gold, white
  elsewhere. Fill with the accent without it and Ultra's buttons become unreadable.
- **The retint is done in CSS, not by re-rendering.** The active ball writes `--ball-*`
  onto `<html>`; the `--pd-*` device tokens read through them with the Poké Ball as
  fallback. Anything already painted with a token follows for free, the device is themed
  correctly before any JS runs, and a `.35s` transition on the shell does the fade.

The choice persists to `localStorage`. The store is a `useSyncExternalStore` subscription
(`client/src/lib/ballThemes.ts`), so components that need the descriptor itself — the
switcher's selected state — re-render, while everything painted with a token does not.

---

### A note on sprites

PokéAPI returns sprite URLs pointing at `raw.githubusercontent.com`, which is a source
host rather than a CDN: rate limited, uncached, and blocked outright on plenty of
corporate and ISP networks — where every sprite silently fails and the Pokédex renders as
a grid of empty halos. The server rewrites those URLs onto jsDelivr, which mirrors the
exact same repository at the exact same paths, so it is a host swap and nothing else
(`server/src/services/pokeapi.ts`).

---

## Tech Stack

| Layer | Choice |
| --- | --- |
| Client | React 19, TypeScript, Vite |
| Styling | Tailwind CSS with CSS-variable design tokens |
| Routing | React Router 7 |
| Icons | Lucide |
| Type | Space Grotesk (display), Instrument Sans (body), JetBrains Mono (readouts) |
| Server | Node 20, Express 4, TypeScript |
| Tooling | ESLint (typescript-eslint + react-hooks) |

No data-fetching library: the request logic is small, and hand-rolling it keeps the
abort/retry/race behaviour explicit and visible.

## API Used

[PokéAPI](https://pokeapi.co/) v2 — `https://pokeapi.co/api/v2/`. No key required.

The client never calls PokéAPI directly. It talks to this project's API, which:

- normalises PokéAPI's verbose payloads into the exact shapes the UI renders,
- caches every record in process for 24 hours and coalesces concurrent requests for the
  same record into one upstream call,
- filters and sorts over the **whole** Pokédex rather than the current page,
- warms a stat index in the background at boot, so sorting by HP or attack does not have
  to fetch a thousand records on first use,
- returns one error shape, `{ error: { code, message } }`, for every failure.

### Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/pokemon` | Paged list. Query: `offset`, `limit` (≤60), `type`, `q`, `sort`, `order` |
| `GET` | `/api/pokemon/:nameOrId` | Full record for one Pokémon |
| `GET` | `/api/types` | All types with counts, plus the total species count |
| `GET` | `/health` | Liveness. Always 200 while the process is up; never calls PokéAPI |
| `GET` | `/health/ready` | Readiness. 200 once the stat index is warm, 503 (`degraded`) while it warms |

Both are also mounted under `/api` (`/api/health`, `/api/health/ready`) so a browser can
reach them when only `/api` is proxied through to the server.

Point a platform health check at **`/health`**, not `/health/ready` — warming fetches all
1,025 species and takes minutes on a cold instance, far longer than a default
health-check grace period, so a readiness probe would fail the deploy.

## Installation

Requires Node 20 or newer.

```bash
git clone https://github.com/Amrit-Nigam/task.git
cd task

cd server && npm install
cd ../client && npm install
```

The server and the client are independent packages, each with its own `package.json`
and lockfile. There is nothing to install at the repository root.

## Running Locally

Two terminals:

```bash
cd server && npm run dev     # http://localhost:4000
cd client && npm run dev     # http://localhost:5173
```

Open http://localhost:5173. Vite proxies `/api` to the local server, so there is nothing
to configure for development.

Other scripts:

```bash
cd client && npm run build       # type-check and build the client
cd client && npm run typecheck   # types only
cd client && npm run lint        # ESLint over the client

cd server && npm run build       # compile the server
cd server && npm start           # run the built server
```

Environment variables are documented in `client/.env.example` and `server/.env.example`.
For a deployed client, set `VITE_API_BASE` to the API's origin.

## Deployment

The two halves want different hosts, and the reason is in the server's design rather than
in a preference: it warms an index of all 1,025 species at boot and keeps that index, plus
a 24-hour detail cache, in process memory. That is the whole basis for filtering and stat
sorting across the entire Pokédex rather than across the loaded page. On a serverless
platform each invocation may land on a fresh instance, so the cache would rarely be hit,
the warm-up would restart on every cold boot, and it would be killed by the function
timeout long before it finished.

**So: the client goes on Vercel as a static site, and the server goes on a host that runs
a long-lived process** — Render, Railway and Fly.io all do this on a free or cheap tier.
Deploying the server as Vercel functions would technically respond, but every stat sort
would re-fetch the Pokédex from upstream.

### Client → Vercel

Import the repository and set **Root Directory** to `client`. `client/vercel.json` supplies
the rest — build command, output directory, the SPA rewrite that makes `/pokemon/pikachu`
resolve on a hard refresh, and cache headers (immutable for hashed assets, revalidate for
`index.html`).

One environment variable, for every environment you use:

| Variable | Value |
| --- | --- |
| `VITE_API_BASE` | `https://your-api.onrender.com` — the API's origin, no trailing slash, no `/api` |

`VITE_API_BASE` is read by Vite at **build** time and inlined into the bundle, so changing
it in the dashboard does nothing until you redeploy. It is also the only client variable
that ships: anything named `VITE_*` is public, so never put a secret in one.

### Server → Render / Railway / Fly.io

Root directory `server`, and:

```
Build command:  npm ci && npm run build
Start command:  npm start
Health check:   /health
```

| Variable | Required | Value |
| --- | --- | --- |
| `PORT` | usually not | The host injects it; the server reads `process.env.PORT` and falls back to 4000. Do not hard-code it |
| `CORS_ORIGIN` | yes | Comma-separated origins allowed to call the API, e.g. `https://your-pokedex.vercel.app`. **Unset means any origin** |
| `POKEAPI_BASE_URL` | no | Only if you mirror or proxy PokéAPI. Defaults to `https://pokeapi.co/api/v2` |

Two things that bite here:

- **Vercel preview deployments get their own hostname** (`project-git-branch-user.vercel.app`),
  so a `CORS_ORIGIN` listing only the production domain blocks every preview. Either add the
  preview hostnames, or leave `CORS_ORIGIN` unset — this is a public, read-only, unauthenticated
  API over public data, so allowing any origin costs nothing. Do not leave it unset out of
  habit on a service that ever gains writes or auth.
- **Free tiers idle out.** Render's free instances sleep after inactivity, and waking one
  re-runs the boot warm-up, so the first stat sort after a long quiet period is slow. The
  UI already handles this honestly — it shows "Building the stat index — ordering will
  settle shortly" while `/health/ready` reports `degraded`.

### Checking a deployment

```bash
curl https://your-api.onrender.com/health          # {"status":"ok", ...}
curl https://your-api.onrender.com/health/ready    # 503 -> 200 once warm
curl https://your-api.onrender.com/api/types       # real data

# the client is wired to the right API if this returns JSON, not HTML
curl -I https://your-pokedex.vercel.app/pokemon/pikachu   # 200, not 404
```

## Project Structure

```
task/
├── client/
│   └── src/
│       ├── components/       PokemonCard, PokemonGrid, SearchBar, TypeFilter,
│       │                     SortControl, DetailPanel, CompareTray, CompareDialog,
│       │                     StatMeter, TypeChip, CardSkeleton, ErrorState, EmptyState
│       ├── hooks/            usePokemonList, usePokemonDetail, useTypes, useFavorites,
│       │                     useFavoritePokemon, useTheme, useDebouncedValue,
│       │                     useMediaQuery
│       ├── lib/              ballThemes (the four casings), types-theme (the type
│       │                     colour system), format, utils
│       ├── pages/            ExplorerPage
│       ├── services/         pokemonApi — every network call and its error mapping
│       └── types/            pokemon — shapes shared with the server
│
└── server/
    └── src/
        ├── lib/              cache (TTL + single-flight), concurrency, errors,
        │                     async-handler
        ├── routes/           pokemon — list, detail, types
        ├── services/         pokeapi — upstream client, normalisation, stat index
        └── types.ts
```

## Challenges Faced

**Sorting by a base stat needs data the list endpoint doesn't have.** PokéAPI's
`/pokemon` list returns only names and URLs, so ordering 1,025 Pokémon by attack means
holding all 1,025 detail records. Sorting only the loaded page would have been the easy
answer and the wrong one — the ordering would change every time you pressed "Load more".
The server instead warms a full detail index in the background at boot with a bounded
concurrency of 16, and the list response carries an `indexing` flag so the UI can say the
ordering is still settling rather than silently showing a partial sort.

**Type filtering is a different resource.** `/type/{type}` returns its own member list
with no detail and no dex ordering, and it includes alternate forms with ids above
10,000 that clutter a browsing index. The server intersects that list with the dex index,
which both drops the forms and restores national dex order.

**Races between search, filter and sort.** Every input can change while a request is in
flight. Each hook holds an `AbortController` and aborts the previous request, and the
detail hook additionally tags its state with the name it belongs to — so a slow response
for the previously selected Pokémon can never paint over the current one.

**Stampeding the upstream API.** Twenty-four cards rendering at once, each needing a
detail record, plus a background warm-up, would have hammered PokéAPI with duplicate
requests. A single-flight wrapper collapses concurrent requests for the same key into one
promise, and everything lands in a 24-hour TTL cache.

**Dual-type counting.** Summing the per-type counts gives 1,551, not 1,025, because
dual-type Pokémon appear under both types. The "All" pill reports the dex size from the
name index instead.

## Future Improvements

- Persist the cache (Redis or a small SQLite file) so a restart doesn't re-warm, and so
  the API can run on serverless infrastructure.
- Evolution chains and type-effectiveness charts in the detail panel — both are one more
  PokéAPI resource each.
- Virtualised grid, so browsing deep into the dex stays cheap on low-end devices.
- Encode filter, sort and search in the URL, making any view shareable rather than only
  the detail panel.
- Compare more than two Pokémon, and compare against a type's average.
- Component and API tests: the sort/filter/pagination logic in `routes/pokemon.ts` and
  the state machines in `usePokemonList` are the parts most worth pinning down.
