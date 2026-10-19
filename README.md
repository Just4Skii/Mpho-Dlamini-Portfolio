# GraffGrid · Independent Developer Portfolio & Project Platform

A modern, high-performance **independent multi-application platform** for **Mpho Dlamini** ([graffgrid.co.za](https://graffgrid.co.za)).

Rather than a monolithic single-page app, GraffGrid is engineered as a **collection of truly independent applications** developed, built, and updated independently under the same domain — five live React/native products and one reserved slot.

---

## 🏛️ Directory & Application Architecture

```
graffgrid/ (Workspace Root)
│
├── backup/                            # Pre-change backups of edited files (untracked)
│
├── portfolio/                         # Independent React App: GraffGrid Portfolio (/)
│   ├── src/
│   │   ├── components/                # Scoped portfolio & showcase components
│   │   ├── config/projects.ts         # Metadata registry ONLY (zero project code imports)
│   │   ├── pages/                     # HomePage (/), WorkPage (/work), 404
│   │   └── styles/                    # Scoped CSS modules
│   ├── public/                        # CNAME, favicon.svg, card previews (klarrow/stickerbridge)
│   └── index.html
│
├── projects/
│   │
│   ├── klarrow/                       # Klarrow Evidence Workbench (/work/klarrow) — FLAGSHIP
│   │   ├── src/                       # The REAL Klarrow workbench UI (vendored from Just4Skii/Klarrow)
│   │   ├── .env.production            # VITE_API_BASE (engine URL) + VITE_PUBLIC_DEMO=1
│   │   └── README.md                  # Embedding contract + demo guards
│   │
│   ├── apex/                          # Independent React App: Apex Facilities Group (/work/apex)
│   ├── kasicart/                      # Independent React App: KasiCart (/work/kasicart)
│   ├── carepoint/                     # Independent React App: CarePoint (/work/carepoint)
│   ├── stickerbridge/                 # StickerBridge product site (/work/stickerbridge) + APK link
│   └── project-four/                  # Reserved future application slot (coming-soon card)
│
├── .github/workflows/deploy.yml       # Build → publish site into this branch → Pages serves root
├── assemble-dist.js                   # Assembles workspace dists into the GitHub Pages tree
├── package.json                       # Root workspace orchestrator (npm workspaces)
└── README.md
```

**Published tree (committed by CI on every source change):** `index.html`, `404.html`, `CNAME`, `.nojekyll`, `favicon.svg`, `assets/`, `work/<app>/…` and root-level public assets (card previews, brand icons). Source folders are never touched by publishing; `mpho_portfolio.html` is the preserved original single-file portfolio.

---

## 🔒 Complete Architectural & Runtime Isolation

| Dimension | Isolation Implementation |
|---|---|
| **Independent Codebases** | The portfolio contains **zero** project application imports. It knows only registry metadata (title, summary, tags, URL). |
| **Independent Routing** | Each app owns its own base path (`/`, `/work/apex/`, `/work/kasicart/`, …). Deep links restore through the master `404.html` + `?/` pathname convention. |
| **Independent State** | KasiCart cart state, Apex forms, Portfolio state and the Klarrow workbench session never overlap. |
| **CSS & Design Systems** | Each app owns its own CSS environment (no shared Tailwind runtime across apps). The Klarrow case-study overlay is scoped under `.cs` so it cannot leak into the workbench stylesheet. |
| **Asset & Metadata Isolation** | Per-app titles, meta tags, favicons, previews. |
| **Unobtrusive Exit** | Standalone apps carry a fixed `← GraffGrid` pill; the Klarrow pill additionally toggles the in-app case-study overlay. |

### Klarrow — the one split-architecture app

Klarrow is a **client + engine** system: the React workbench UI lives here (`projects/klarrow/`), while its .NET 10 API engine (document parsing, SHA-256 dedupe, review desk, dual-path traces, SQLite, Llama pipeline) is deployed from [Just4Skii/Klarrow](https://github.com/Just4Skii/Klarrow) to Render (`https://klarrow.onrender.com`).

Public-demo contract (belt **and** braces):
- UI hides upload affordances via `VITE_PUBLIC_DEMO=1`
- Engine rejects uploads server-side (`Demo__PublicMode=true` → 403)
- Workspace auto-seeds the synthetic **Savanna Bites** evidence pack (24 documents) on boot
- Per-IP rate limiting is opt-in on the engine (`RateLimit:Enabled`)

---

## 🌐 Public URL Architecture

- `https://graffgrid.co.za/` · GraffGrid Portfolio Overview
- `https://graffgrid.co.za/work` · Filterable Work Showcase
- `https://graffgrid.co.za/work/klarrow` · Klarrow — live synthetic-only evidence workbench (flagship)
- `https://graffgrid.co.za/work/apex` · Apex Facilities Group
- `https://graffgrid.co.za/work/kasicart` · KasiCart Commerce
- `https://graffgrid.co.za/work/carepoint` · CarePoint Healthcare
- `https://graffgrid.co.za/work/stickerbridge` · StickerBridge product site (+ direct APK)
- `https://klarrow.onrender.com` · Klarrow engine (Render; health: `/api/health`)

---

## 🛠️ Independent Development Commands

```bash
npm run dev:portfolio       # Portfolio  → http://localhost:5173/
npm run dev:apex            # Apex
npm run dev:kasicart        # KasiCart
npm run dev:carepoint       # CarePoint
npm run dev:stickerbridge   # StickerBridge
npm run dev:klarrow         # Klarrow workbench (proxies /api → http://127.0.0.1:5099)

npm run build:<app>         # Build one app into its own dist/
npm run build               # Build ALL workspaces + assemble-dist.js
```

Klarrow dev needs its engine running for data: start the API from the Klarrow repo
(`start-klarrow.cmd` on :5099). Without it, the workbench boots to its offline state.

---

## 🚀 Deployment (branch publishing)

GitHub Pages serves **the repository root of `main`**. The workflow:

1. `push` to `main` (publish commits are filtered out via `paths-ignore` → no loops)
2. Build every workspace, run `assemble-dist.js` (portfolio at root, each app under `work/<app>/`, master `404.html`, `CNAME`, `.nojekyll`)
3. Copy the assembled tree into the repo root and push a `chore(publish): …` commit
4. GitHub's Pages build picks up the publish commit and deploys the root tree

`.nojekyll` disables Jekyll processing so raw assets (including underscore-free hashed bundles) serve untouched. Deployed source-of-truth is therefore `main` itself — the last publish commit shows exactly what's live.

---

## 📦 How to Add a Future Project

1. Place the standalone app in `projects/<name>/` (own `package.json`, `vite.config.ts` with the right base path).
2. Add the workspace to root `package.json` + a `dev:<name>` / `build:<name>` script.
3. Add the copy step in `assemble-dist.js` and the matching branch in the master `404.html`.
4. Register the entry in `portfolio/src/config/projects.ts` (registry metadata only).
5. `npm run build` → commit → the workflow publishes.

---

## 👤 Developer & Contact

- **Mpho Dlamini** (GraffGrid)
- **Contact**: `Mphojunior6@gmail.com` · `067 602 9081` · Durban, KwaZulu-Natal
- **GitHub**: [github.com/Just4Skii](https://github.com/Just4Skii)
- **LinkedIn**: [tinyurl.com/Mpho-dlamini](https://tinyurl.com/Mpho-dlamini)
