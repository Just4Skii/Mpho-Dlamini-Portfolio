# GraffGrid — Independent Developer Portfolio & Project Platform

A modern, high-performance **independent multi-application platform** for **Mpho Dlamini** ([graffgrid.co.za](https://graffgrid.co.za)).

Rather than a monolithic single-page app, GraffGrid is engineered as a **collection of truly independent React applications** developed, built, tested, and updated independently under the same domain.

---

## 🏛️ Directory & Application Architecture

```
graffgrid/ (Workspace Root)
│
├── backup/
│   └── mpho_portfolio.html            # Original preserved single-file HTML portfolio
│
├── portfolio/                         # Independent React App: GraffGrid Portfolio (/)
│   ├── src/
│   │   ├── components/                # Scoped portfolio & showcase components
│   │   ├── config/projects.ts         # Metadata registry ONLY (Zero project code imports)
│   │   ├── pages/                     # HomePage (/), WorkPage (/work), 404
│   │   └── styles/                    # Scoped CSS modules
│   ├── public/                        # CNAME, favicon.svg
│   ├── index.html                     # Title: Mpho Dlamini — GraffGrid Portfolio
│   ├── vite.config.ts                 # base: '/' -> builds to portfolio/dist
│   ├── tsconfig.json
│   └── package.json
│
├── projects/
│   │
│   ├── apex/                          # Independent React App: Apex Facilities Group
│   │   ├── src/                       # Complete standalone source (components, pages, lib)
│   │   ├── public/                    # Dedicated favicon.svg, assets
│   │   ├── index.html                 # Title: Apex Facilities Group
│   │   ├── vite.config.ts             # base: '/work/apex/' -> builds to projects/apex/dist
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── kasicart/                      # Independent React App: KasiCart
│   │   ├── src/                       # Complete standalone source (components, store, data)
│   │   ├── public/                    # Dedicated favicon.ico, assets
│   │   ├── index.html                 # Title: KasiCart — Good things, close to home
│   │   ├── vite.config.ts             # base: '/work/kasicart/' -> builds to projects/kasicart/dist
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── carepoint/                     # Reserved CarePoint Application Slot
│   │   └── README.md                  # Integration guide & contract
│   │
│   └── project-four/                  # Reserved Future Application Slot
│       └── README.md
│
├── .github/
│   └── workflows/
│       └── deploy.yml                 # Multi-app CI/CD build & GitHub Pages deployment
│
├── assemble-dist.js                   # Assembles independent dist outputs into GitHub Pages tree
├── package.json                       # Root workspace orchestrator
└── README.md
```

---

## 🔒 Complete Architectural & Runtime Isolation

| Dimension | Isolation Implementation |
|---|---|
| **Independent Codebases** | The portfolio contains **zero** project application imports. It knows only metadata (title, summary, tags, URL). |
| **Independent Routing** | Portfolio, Apex, and KasiCart have their own `BrowserRouter` with dedicated base paths (`/`, `/work/apex/`, `/work/kasicart/`). |
| **Independent State** | KasiCart cart/wishlist context, Apex CRM forms, and Portfolio state never overlap. |
| **CSS & Design Systems** | Each app owns its own CSS environment. Apex uses warm stone/ink styles; KasiCart uses cream/terracotta; Portfolio uses dark slate. |
| **Asset & Metadata Isolation** | Each app has its own document title, meta tags, and favicons. |
| **Unobtrusive Exit** | Standalone apps include a native `<a href="/work">` escape button (`← GraffGrid`) to return to the portfolio. |

---

## 🌐 Public URL Architecture

- `https://graffgrid.co.za/` — GraffGrid Portfolio Overview
- `https://graffgrid.co.za/work` — Filterable Work Showcase
- `https://graffgrid.co.za/work/apex` — Apex Facilities Group Standalone Application
- `https://graffgrid.co.za/work/kasicart` — KasiCart South African Commerce Standalone Application
- `https://graffgrid.co.za/work/carepoint` — CarePoint Healthcare Platform (Reserved Slot)

---

## 🛠️ Independent Development Commands

### Run Any Application Independently:
```bash
# Run Portfolio App on http://localhost:5173/
npm run dev:portfolio

# Run Apex App on http://localhost:5174/
npm run dev:apex

# Run KasiCart App on http://localhost:5175/
npm run dev:kasicart
```

### Build Any Application Independently:
```bash
# Build Portfolio
npm run build:portfolio

# Build Apex
npm run build:apex

# Build KasiCart
npm run build:kasicart
```

### Build & Assemble Entire Platform for Deployment:
```bash
npm run build
```

---

## 🚀 GitHub Pages Multi-App Deployment Assembly

The build script compiles each application independently and `assemble-dist.js` structures the static files:

```
dist/
├── CNAME                              # graffgrid.co.za
├── 404.html                           # Multi-app SPA redirector
├── favicon.svg
├── index.html                         # GraffGrid entry
├── assets/                            # Portfolio JS/CSS assets
│
└── work/
    ├── apex/
    │   ├── index.html                 # Apex entry point
    │   └── assets/                    # Apex JS/CSS assets
    │
    └── kasicart/
        ├── index.html                 # KasiCart entry point
        └── assets/                    # KasiCart JS/CSS assets
```

Deep-linking directly to nested routes (e.g. `https://graffgrid.co.za/work/apex/services/reactive-repairs` or `https://graffgrid.co.za/work/kasicart/shop`) will redirect through `404.html` and restore the sub-application route cleanly without 404 errors.

---

## 📦 How to Add CarePoint (or Future Projects)

1. Place completed standalone React app into `projects/carepoint/`.
2. Configure `base: mode === 'production' ? '/work/carepoint/' : '/'` in `vite.config.ts`.
3. Add `"projects/carepoint"` to `workspaces` in root `package.json`.
4. In `assemble-dist.js`, add copy step to `dist/work/carepoint/`.
5. Update `status: 'live'` in `portfolio/src/config/projects.ts`.
6. Run `npm run build` and deploy.

---

## 👤 Developer & Contact

- **Mpho Dlamini** (GraffGrid)
- **Contact**: `Mphojunior6@gmail.com` · `067 602 9081` · Durban, KwaZulu-Natal
- **GitHub**: [github.com/Just4Skii](https://github.com/Just4Skii)
- **LinkedIn**: [tinyurl.com/Mpho-dlamini](https://tinyurl.com/Mpho-dlamini)
