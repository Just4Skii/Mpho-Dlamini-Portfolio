# CarePoint — Healthcare Discovery & Appointment Platform (Application Slot)

## Overview & Concept

CarePoint is an independent healthcare product concept exploring South African healthcare discovery, clinic/provider mapping, accessible appointment scheduling, and patient intake workflows.

**Positioning**: Independent healthcare product concept designed and engineered from scratch. Not a real healthcare provider.

---

## 🚀 How to Integrate CarePoint When Completed

When your CarePoint React application finishes development, follow these steps to integrate it into GraffGrid as an independent application:

### Step 1: Place Your Project Files
Place the complete standalone React application into this directory (`projects/carepoint/`):
```
projects/carepoint/
├── src/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### Step 2: Configure Vite Base Path
In `projects/carepoint/vite.config.ts`, set the production base path:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/work/carepoint/' : '/',
  build: {
    outDir: 'dist',
  },
}));
```

### Step 3: Add Router Basename
In `projects/carepoint/src/main.tsx`:
```tsx
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

### Step 4: Add to Root Workspaces & Build Pipeline
1. In root `package.json`, add `"projects/carepoint"` to `"workspaces"`.
2. Add script: `"build:carepoint": "npm --workspace=carepoint run build"`.
3. In `assemble-dist.js`, add:
```js
const carepointDist = path.resolve('projects/carepoint/dist');
const carepointDest = path.join(rootDist, 'work', 'carepoint');
copyDir(carepointDist, carepointDest);
```
4. In `portfolio/src/config/projects.ts`, change CarePoint `status` from `'coming-soon'` to `'live'`.

### Step 5: Test Independent Build
```bash
npm run build:carepoint
npm run build
```
CarePoint will be served live at `https://graffgrid.co.za/work/carepoint` with zero dependencies on other applications!
