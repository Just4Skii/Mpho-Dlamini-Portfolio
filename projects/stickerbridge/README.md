# StickerBridge - Independent React Product Site

**TikTok to WhatsApp Sticker Importer** - product site for the native Android app,
hosted on GraffGrid under `/work/stickerbridge` as a fully independent application
(same contract as Apex, KasiCart, CarePoint: own router, state, styles, and build).

## Run / Build Independently

```bash
npm run dev:stickerbridge    # http://localhost:5173/ (or next free port)
npm run build:stickerbridge  # outputs to projects/stickerbridge/dist
```

## Platform Wiring

- `vite.config.ts` → `base: './'` (relative assets, served from `dist/work/stickerbridge/`)
- `src/main.tsx` → dynamic `BrowserRouter` basename matching `/work/stickerbridge`
- Root `package.json` → workspace `projects/stickerbridge` + `dev`/`build` scripts
- `assemble-dist.js` → copies `dist` to `dist/work/stickerbridge/` + 404 deep-link branch
- Escape hatch: fixed `← GraffGrid` pill (`ReturnToPortfolio`) returns to `/work`
- Registry: `portfolio/src/config/projects.ts` → `id: 'stickerbridge'`, internal `path`

## About the Android App (companion, separate repo)

| Attribute | Details |
| :--- | :--- |
| **App** | TikTok → WhatsApp sticker importer & animated engine |
| **Source** | `https://github.com/Just4Skii/StickerBridge` |
| **APK** | `https://github.com/Just4Skii/StickerBridge/raw/main/stickerbridge.apk` (~20 MB) |
| **Stack** | Kotlin, Jetpack Compose (Material 3), Coroutines & Flow, ContentProvider API |
| **Support** | Android 8.0 (API 26) → Android 15+ (API 35) |

Core engines: `TikTokCacheScanner.kt` (1-tap cache discovery), `WebpProcessingEngine.kt`
(lossless VP8X/ANMF → 512×512), `TikTokIngester.kt` (link/carousel + 3-sticker padding),
`StickerContentProvider.kt` (official WhatsApp sticker API). Full dossier:
`PORTFOLIO_DOC.md` in the Android repo.

## Site Content

Single-page product site (`src/pages/Landing.tsx`): hero with device mockup + transfer
demo, 3-step flow, feature grid, tech/spec breakdown, download card with install steps,
FAQ accordion, trademark footer. Device mockups vendored under `src/assets/`.
