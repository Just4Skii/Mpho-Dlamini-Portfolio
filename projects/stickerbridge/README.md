# StickerBridge — Native Mobile Slot (External Distribution)

> **Slot type**: Externally distributed native Android application.
> This is **not** a Vite SPA, so it intentionally has **no** `package.json` workspace entry,
> **no** `vite.config.ts` `base`, and **no** `assemble-dist.js` copy step.
> Portfolio integration is metadata-only via `portfolio/src/config/projects.ts`
> (`externalUrl` + `downloadUrl`), preserving GraffGrid's runtime isolation contract.

## Project Overview

| Attribute | Details |
| :--- | :--- |
| **Project Name** | **StickerBridge** ⚡ |
| **Subtitle** | TikTok to WhatsApp Sticker Importer & Animated Engine |
| **Author / Creator** | **Mpho** (`Mphojunior6@gmail.com`) |
| **GitHub Handle** | `Skinny1ne` |
| **GitHub Repository** | `https://github.com/Skinny1ne/StickerBridge` |
| **Live Landing Page** | `https://skinny1ne.github.io/StickerBridge/` |
| **Direct APK Download** | `https://github.com/Skinny1ne/StickerBridge/raw/main/stickerbridge.apk` |
| **Target Platforms** | Android (API 26 / Android 8.0 Oreo through API 35 / Android 15+) |
| **Tech Stack** | **Kotlin**, **Jetpack Compose (Material 3)**, **Coroutines & Flow**, **Android ContentProvider API**, **WebP RIFF/VP8X/ANMF Engine**, **HTML5/Modern CSS/Vanilla JS** |
| **Distribution** | Direct Universal APK (Independent, zero app store fees) |

## Source of Truth

Canonical Android source lives outside this monorepo:

- **Project Root**: `D:\Projects\tiktok-whatsapp-stickers\`
- **Dossier**: `D:\Projects\tiktok-whatsapp-stickers\PORTFOLIO_DOC.md`
- **APK**: `stickerbridge.apk` (repo root + `docs/` for Pages)
- **Landing bundle**: `docs/index.html`
- **Icons / mockups**: `docs/stickerbridge_icon.svg`, `docs/stickerbridge_icon.png`, `docs/mockup_{main,scan,dialog}.webp`

### Core Android files

- Manifest: `app/src/main/AndroidManifest.xml`
- 1-Tap scanner: `core/scanner/TikTokCacheScanner.kt`
- WebP engine: `core/engine/WebpProcessingEngine.kt`
- Link ingester: `core/ingestion/TikTokIngester.kt`
- ContentProvider: `core/contentprovider/StickerContentProvider.kt`
- Intent launcher: `core/whatsapp/WhatsAppIntentManager.kt`
- Models/storage: `data/model/StickerPack.kt`, `data/storage/StickerStorageManager.kt`
- UI: `ui/main/MainScreen.kt`, `MainScreenViewModel.kt`

## Why It Was Built

1. **Walled-garden lock-in**: TikTok stickers have no native export to WhatsApp.
2. **Scoped Storage barrier** (Android 11–15): users cannot manually browse `Android/data/` caches.
3. **WhatsApp ingestion spec**: exactly 512×512, ≤100KB static / ≤500KB animated, valid WebP RIFF, VP8X+ANMF for animated, minimum 3 stickers per pack.
4. **Paywall avoidance**: free direct-install open-source APK, no $25 Play fee.

## Architecture (summary)

Discovery (`TikTokCacheScanner` auto-scan + `TikTokIngester` link/carousel) → Processing
(`WebpProcessingEngine` VP8X/ANMF-aware 512×512 normalize, 3-sticker padding) →
Packaging (`StickerStorageManager` → `StickerContentProvider` query/openFile →
WhatsApp; `WhatsAppIntentManager` add-pack intent). Full mermaid diagram in the canonical dossier.

## Portfolio Integration (this repo)

- Registry: `portfolio/src/config/projects.ts` → `id: 'stickerbridge'`, `category: 'Native Mobile Experience'`, `status: 'live'`, `path: '/work/stickerbridge'`, `externalUrl` (Pages landing), `downloadUrl` (raw APK), `githubUrl` (repo).
- Cards (`ProjectCard`, `FeaturedProjects`) branch on `externalUrl`: open in a new tab with `↗`, plus a `Download APK ⤓` ghost link.
- `WorkPage` adds a `Native Mobile` filter; `App.tsx` reserves `/work/stickerbridge` → `WorkPage` so the reserved path never blanks.
- Preview image is vendored locally at `portfolio/public/stickerbridge-preview.webp` (copied from StickerBridge `docs/mockup_main.webp`) and referenced as `/stickerbridge-preview.webp`, so the card art works even before — or independently of — the StickerBridge repo being public.
- No build, workspace, or `dist/work/stickerbridge` changes required by design.

## Go-Live Checklist (GitHub side — required for Launch / APK links)

The portfolio links assume the StickerBridge repo exists at `github.com/Skinny1ne/StickerBridge`.
Until it is created and pushed, Launch Experience / GitHub / APK links will 404. Steps:

1. On GitHub, create a **public** repository named `StickerBridge` under `Skinny1ne` (no README/license — the local repo already has them).
2. In `D:\Projects\tiktok-whatsapp-stickers\`:
   `git remote add origin https://github.com/Skinny1ne/StickerBridge.git`
   `git push -u origin main`
3. Enable Pages: repo **Settings → Pages → Deploy from a branch → `main` → `/docs` → Save**.
   The landing page then goes live at `https://skinny1ne.github.io/StickerBridge/`, the APK at `/stickerbridge.apk` beneath it, and the raw download URL starts resolving.
