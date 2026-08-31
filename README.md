# GraffGrid — Developer Portfolio Platform

A modern, high-performance **React + TypeScript + Vite** portfolio platform for **Mpho Dlamini** ([graffgrid.co.za](https://graffgrid.co.za)).

This platform serves as both a **personal developer portfolio** and an **isolated frontend project host** capable of running independently engineered commercial and consumer applications under dedicated URL paths with zero style or state leakage.

---

## 🏛️ Platform Architecture

```
graffgrid/ (Workspace Root)
│
├── backup/
│   └── mpho_portfolio.html            # Original preserved HTML portfolio (Safe rollback checkpoint)
│
├── public/
│   ├── CNAME                          # graffgrid.co.za
│   ├── 404.html                       # GitHub Pages SPA redirect engine for deep URL routing
│   └── favicon.svg                    # SVG Brand Favicon
│
├── src/
│   ├── main.tsx                       # React root entry point
│   ├── App.tsx                        # Master Router with lazy-loaded project routes
│   │
│   ├── config/
│   │   └── projects.ts                # Centralized Project Registry & Honest Disclosures
│   │
│   ├── types/
│   │   └── project.ts                 # TypeScript project data interfaces
│   │
│   ├── components/
│   │   ├── portfolio/                 # Scoped GraffGrid portfolio components (Hero, Services, etc.)
│   │   ├── work/                      # Dedicated Work Page & Filterable Showcase
│   │   └── common/                    # ReturnToPortfolio escape bar, Modals, Loaders
│   │
│   ├── pages/
│   │   ├── HomePage.tsx               # Portfolio landing page (/)
│   │   ├── WorkPage.tsx               # Dedicated Work page (/work)
│   │   └── NotFoundPage.tsx           # 404 handler with return links
│   │
│   ├── styles/
│   │   ├── portfolio.module.css       # Scoped CSS modules (No global tag pollution)
│   │   └── base.css                   # Scoped container reset
│   │
│   └── projects/                      # Standalone Project Sub-Apps (Code-Split / Lazy-Loaded)
│       ├── apex/                      # Apex Facilities Group (/work/apex/*)
│       ├── kasicart/                  # KasiCart South African Commerce (/work/kasicart/*)
│       ├── carepoint/                 # CarePoint Healthcare Discovery (Integration slot)
│       └── project-four/              # Reserved future slot
│
├── .github/
│   └── workflows/
│       └── deploy.yml                 # Automated CI/CD GitHub Pages deployment workflow
│
├── index.html                         # Vite HTML template with SEO tags & SPA loader script
├── vite.config.ts                     # Optimized bundler config with chunk code-splitting
├── tsconfig.json                      # Strict TypeScript configuration
└── package.json
```

---

## 🔒 Strict Project Isolation

Each project hosted on GraffGrid is treated as an independent product:

| Dimension | Isolation Strategy |
|---|---|
| **CSS / Design System** | Portfolio styling uses scoped CSS modules. Project applications mount inside dedicated container elements with isolated CSS scopes. No global style pollution between projects. |
| **State Management** | Context stores, cart state, and UI state remain entirely inside each project's React subtree. |
| **Navigation & Escape** | Each project retains its own internal navigation. An unobtrusive floating bar (`← GraffGrid`) allows instant return to `/work` with scroll memory. |
| **Asset & Code Loading** | Standalone project chunks are lazy-loaded on demand via `React.lazy()`—the portfolio homepage remains lightweight and fast. |

---

## 🧭 URL Architecture

- `https://graffgrid.co.za/` — Personal portfolio overview & highlights
- `https://graffgrid.co.za/work` — Filterable Work showcase with honest concept disclosures
- `https://graffgrid.co.za/work/apex` — Apex Facilities Group interactive application
- `https://graffgrid.co.za/work/kasicart` — KasiCart South African commerce platform
- `https://graffgrid.co.za/work/carepoint` — CarePoint healthcare concept (Reserved integration slot)
- `https://graffgrid.co.za/work/project-four` — Future reserved slot

---

## 📦 How to Import CarePoint (or Any New Project)

When the completed CarePoint project (or any new React project from an external AI environment) is ready, integrate it in 5 simple steps:

### Step 1: Place Project Files
Copy your project components, pages, styles, and data into:
```
src/projects/carepoint/
```

### Step 2: Ensure Routing Compatibility
Wrap your routes or internal navigation with the base prefix `/work/carepoint` (or use the included `src/projects/carepoint/compat/next.tsx` helper).

### Step 3: Mount in `src/App.tsx`
Uncomment or add the lazy route:
```tsx
const CarePointApp = lazy(() => import('./projects/carepoint/CarePointApp'));

<Route path="/work/carepoint/*" element={<CarePointApp />} />
```

### Step 4: Update the Project Registry
In `src/config/projects.ts`, update the CarePoint entry:
```ts
{
  id: 'carepoint',
  title: 'CarePoint',
  status: 'live', // Change from 'coming-soon' to 'live'
  ...
}
```

### Step 5: Test & Deploy
```bash
npm run build
npm run preview
```

---

## 🛠️ Local Development Commands

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle with TypeScript type-checking
npm run build

# Preview production build locally
npm run preview
```

---

## 🚀 Deployment to GitHub Pages

The repository includes:
1. `public/CNAME`: Pre-configured for `graffgrid.co.za`.
2. `public/404.html`: Single Page Application (SPA) redirect script that prevents 404 errors on direct deep URL access (e.g., `https://graffgrid.co.za/work/apex`).
3. `.github/workflows/deploy.yml`: GitHub Actions automated build and deployment to GitHub Pages upon pushing to `main` or `master`.

---

## 👤 Identity & Honest Positioning

- **Developer**: Mpho Dlamini (GraffGrid)
- **Contact**: `Mphojunior6@gmail.com` · `067 602 9081` · Durban, KwaZulu-Natal
- **GitHub**: [github.com/Just4Skii](https://github.com/Just4Skii)
- **LinkedIn**: [tinyurl.com/Mpho-dlamini](https://tinyurl.com/Mpho-dlamini)
- **Positioning**: All exploratory projects (Apex, KasiCart, CarePoint) are clearly disclosed as independent concepts designed and engineered from scratch.
