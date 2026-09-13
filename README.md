# GraffGrid — Mpho Dlamini's Developer Portfolio Platform

> **Software Developer | Full Stack & AI**  
> C# / .NET • ASP.NET Core/MVC • React/TypeScript • SQL • Azure/OpenAI • AI/NLP/Computer Vision

[Live portfolio](https://graffgrid.co.za) · [GitHub](https://github.com/Just4Skii) · [LinkedIn](https://tinyurl.com/Mpho-dlamini)

GraffGrid is Mpho Dlamini's independent developer portfolio and project platform. Instead of presenting work as screenshots and disconnected links, the platform treats each showcased application as an independently buildable web product while maintaining one coherent public portfolio.

## Why this repository is interesting

This repository demonstrates **software architecture and delivery**, not just UI work:

- Independent React applications living under one public domain
- TypeScript-based frontend development with React and Vite
- Shared platform orchestration without coupling project source code together
- Route and state isolation between separate applications
- Per-application assets, document metadata and styling
- A multi-app build pipeline that assembles independent build outputs into one deployable site
- GitHub Actions deployment automation
- Production-oriented deep-link handling for nested application routes

## Platform architecture

```text
                        GraffGrid Platform
                               │
              ┌────────────────┴────────────────┐
              │                                 │
        Portfolio App                     Project Apps
          `/` + `/work`                  `/work/*`
              │                                 │
       projects.ts metadata        ┌────────────┼────────────┐
              │                    │            │            │
              ▼                    ▼            ▼            ▼
        Showcase UI              Apex       KasiCart     CarePoint*
                              standalone   standalone   reserved slot

                         Root workspace
                              │
                              ▼
                     npm build orchestration
                              │
                              ▼
                    assemble-dist.js
                              │
                              ▼
                   Single production tree
                              │
                              ▼
                       GitHub Pages
                              │
                              ▼
                     graffgrid.co.za
```

`projects.ts` contains project metadata for the portfolio; the portfolio does not import the application implementations themselves. This keeps the showcase layer decoupled from the applications it presents.

## Application isolation

| Concern | Approach |
|---|---|
| Code | Each React application has its own source tree and build configuration |
| Routing | Each application owns its router and production base path |
| State | Application state is local to the application that owns it |
| Styling | Each app owns its own styling environment |
| Assets | Each app ships its own public assets and metadata |
| Deployment | Independent builds are assembled into a single deployable tree |

## Public applications

- **GraffGrid Portfolio** — `https://graffgrid.co.za/`
- **Work Showcase** — `https://graffgrid.co.za/work`
- **Apex Facilities Group** — `https://graffgrid.co.za/work/apex`
- **KasiCart** — `https://graffgrid.co.za/work/kasicart`
- **CarePoint** — reserved integration slot

## Technology

**Frontend:** React 19, TypeScript, Vite, React Router 7, Tailwind CSS, Framer Motion, Recharts, Leaflet

**Application services:** Supabase client integration where required by individual applications

**Delivery:** npm workspaces, Node.js build orchestration, custom `assemble-dist.js`, GitHub Actions, GitHub Pages

## Repository structure

```text
graffgrid/
├── portfolio/                  # Main portfolio React application
├── projects/
│   ├── apex/                   # Independent Apex application
│   ├── kasicart/               # Independent KasiCart application
│   ├── carepoint/              # Reserved application slot
│   └── project-four/           # Reserved future slot
├── .github/workflows/          # CI/CD workflow(s)
├── assemble-dist.js            # Production output assembly
├── package.json                # Root workspace + orchestration scripts
└── README.md
```

## Development

Install dependencies from the workspace root:

```bash
npm install
```

Run individual applications:

```bash
npm run dev:portfolio
npm run dev:apex
npm run dev:kasicart
```

Build individual applications:

```bash
npm run build:portfolio
npm run build:apex
npm run build:kasicart
```

Build the complete production platform:

```bash
npm run build
```

The root build compiles the applications independently and then runs `assemble-dist.js` to construct the final deployable tree.

## Deployment model

The production site is assembled from independently built applications:

```text
dist/
├── CNAME
├── index.html
├── assets/
└── work/
    ├── apex/
    └── kasicart/
```

The repository also includes a `404.html` route-recovery mechanism so direct navigation into nested SPA routes can be restored after static hosting redirects.

## Engineering decisions

### Why separate applications?

A monolithic portfolio would tightly couple showcase code with demonstration projects. GraffGrid instead treats each showcased experience as a small product that can evolve independently while the portfolio acts as the discovery and presentation layer.

### Why a metadata registry?

The portfolio only needs project identity, descriptions, tags and destination paths. Keeping that information in a registry avoids importing project implementations into the portfolio and reduces coupling.

### Why a custom assembly step?

GitHub Pages serves a static directory tree. `assemble-dist.js` gives the workspace a deterministic way to combine independent Vite outputs while preserving each application's route boundary.

## Portfolio positioning

This repository is the **presentation layer** for a wider engineering portfolio. The most relevant companion projects include:

- [CognitiveVision.AI](https://github.com/Just4Skii/Ai-vision) — ASP.NET Core, Azure Computer Vision, Azure Blob Storage, caching and automated tests
- [Student Management](https://github.com/Just4Skii/Student-management) — ASP.NET Core, Azure services and dedicated tests
- [FixedFunding](https://github.com/Just4Skii/FixedFunding) — React/TypeScript product focused on funding and allowance workflows
- [Solo Soul](https://github.com/Just4Skii/Solo-soul) — booking/product experience with Supabase-backed persistence

The portfolio is intentionally positioned around **building and shipping software**, with student status as background rather than the central identity.

## Developer

**Mpho Dlamini** — Durban, South Africa  
Software Developer focused on full-stack web development, C#/.NET and applied AI.

GitHub: https://github.com/Just4Skii  
Portfolio: https://graffgrid.co.za  
LinkedIn: https://tinyurl.com/Mpho-dlamini
