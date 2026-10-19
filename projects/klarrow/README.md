# Klarrow — Evidence Reconciliation Workbench (embedded on GraffGrid)

`/work/klarrow` now hosts the **real Klarrow workbench UI** — the same React app that
ships in [Just4Skii/Klarrow](https://github.com/Just4Skii/Klarrow) (`src/frontend`),
vendored here so the platform workspace builds it like every other GraffGrid app.

The .NET 10 engine (document parsing, dedupe, review desk, traces, SQLite, Llama
pipeline) **cannot run on GitHub Pages** — it deploys separately (Render blueprint
`render.yaml` in the Klarrow repo) and this UI points at it via `VITE_API_BASE`.

## Enforcing the public-demo contract
- `VITE_PUBLIC_DEMO=1` (`.env.production`) hides upload affordances in this copy.
- The API enforces uploads-off server-side via `Demo__PublicMode=true` (403 on
  `POST /api/documents/upload`) — UI hiding is belt-and-braces, the server is the law.
- `Seed:DemoEnabled=true` keeps the synthetic Savanna Bites workspace pre-seeded.
- Per-IP rate limiting is opt-in server side (`RateLimit:Enabled`).

## Working from this workspace (the platform pattern)

```bash
npm run dev:klarrow      # UI dev server on :5176, proxies /api -> http://127.0.0.1:5099
npm run build:klarrow    # tsc -b + vite build
npm run build            # builds the whole platform + assemble-dist.js
```

For a full local stack, run the API from the Klarrow repo (its `start-klarrow.cmd`
starts the API on :5099); this app's Vite proxy then serves it same-origin with no
configuration. Without an API, the UI starts in its offline state — expected.

### Pointing at a different engine
`.env.production` holds `VITE_API_BASE=https://klarrow.onrender.com`. Change the host
there and rebuild if the demo engine moves.

## Code map
- `src/App.tsx`, `src/api.ts`, `src/types.ts`, `src/reviewLogic.ts`, `src/components/*` — vendored workbench (canonical copies live in the Klarrow repo; sync from there when it changes).
- `src/AppShell.tsx` — platform wrapper: GraffGrid pill + "About" overlay toggle.
- `src/pages/CaseStudy.tsx` + `src/index.css` — the case study (About overlay), fully
  scoped under `.cs` so it cannot collide with the workbench stylesheet (`App.css`).
- `src/components/ReturnToPortfolio.tsx` — platform pill (with About button).

## Case-study page
The former standalone case-study page (`/work/klarrow` landing) is preserved as the
in-app **About** overlay, opened from the pill. Evaluation numbers there are copied
verbatim from the Klarrow repo README (13/13 deterministic scenarios; Llama run:
A pass · B pass · C 11/13; Run 4 end-to-end; 43/43 xUnit; 25/25 Playwright) with the
same honest positioning labels: prototype, synthetic data only, not a food-safety
compliance product.
