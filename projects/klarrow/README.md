# Klarrow · Independent React Case-Study Site

**AI evidence-reconciliation workbench** (ASP.NET Core .NET 10 · React 19 · EF Core + SQLite · local Llama 3.2 3B) ·
case-study page for the full-stack prototype, hosted on GraffGrid under `/work/klarrow` as a fully
independent application (same contract as Apex, KasiCart, CarePoint, StickerBridge: own router, state, styles, and build).

**Positioning:** prototype / MVP case study with synthetic-data disclaimers only. No live multiplayer app, no uploads,
no public food-safety claims. An interactive no-upload sandbox on pre-seeded synthetic data is planned.

## Run / Build Independently

```bash
npm run dev:klarrow    # local dev server
npm run build:klarrow  # outputs to projects/klarrow/dist
```

## Platform Wiring

- `vite.config.ts` → `base: './'` (relative assets, served from `dist/work/klarrow/`)
- `src/main.tsx` → dynamic `BrowserRouter` basename matching `/work/klarrow`
- Root `package.json` → workspace `projects/klarrow` + `dev`/`build` scripts
- `assemble-dist.js` → copies `dist` to `dist/work/klarrow/` + 404 deep-link branch
- Escape hatch: fixed `← GraffGrid` pill (`ReturnToPortfolio`) returns to `/work`
- Registry: `portfolio/src/config/projects.ts` → `id: 'klarrow'`, `path: '/work/klarrow'`, `githubUrl`

## About the Application (companion, separate repo)

| Attribute | Details |
| :--- | :--- |
| **Repo** | `https://github.com/Just4Skii/Klarrow` |
| **Stack** | ASP.NET Core / .NET 10, EF Core + SQLite, React + TypeScript + Vite, Ollama (Llama 3.2 3B) |
| **Quality** | 43/43 xUnit integration tests · 25/25 Playwright end-to-end tests · CI on push/PR |
| **Docs** | Pitch-readiness + evaluation dossier under `docs/` in the application repo |

## Page Content

Single-page case study (`src/pages/CaseStudy.tsx`): hero with product mark + stack chips, synthetic-data
banner, problem grid (the four recall questions), 7-step pipeline with dual-path trace note, capability grid,
AI-discipline section (propose / decide / preserve / never-decides), evaluation table (deterministic 13/13,
llama A+B pass + C 11/13, Run 4 baseline, 43+25 test suites) with scope note, engineering grid,
designed-for vs explicitly-not columns, sandbox status panel with CTAs (GitHub + request controlled demo).
