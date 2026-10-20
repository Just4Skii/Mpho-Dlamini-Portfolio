# Skii OS — Anime-Themed Android TV Launcher (browser port)

`/work/skii-os` is a **live browser port of the Skii OS television launcher** — the
custom Android TV home screen built for the Skyworth 32E5400H (Android 14, MediaTek
mt5867, 1 GB RAM, no Play Services).

The Android build is the real product. This is the same rendering engine, the same
realm manifest and the same ambience sprite atlases, running in a browser so the
whole thing can be opened, driven and judged without a television.

```bash
npm run dev:skii-os      # live dev server on :5177
npm run build:skii-os    # tsc -b + vite build
npm run build            # builds the whole platform + assemble-dist.js
```

## What it is

- **58 anime realms**, each with a palette sampled from its own artwork and a title,
  subtitle and piece of lore.
- **A 19-family ambience engine.** Every realm declares the motion that belongs to
  its picture: a demon made of fire gets embers, a rainbow beam gets an aurora, a
  field of white seed heads gets dandelion, a meadow of butterflies gets butterflies.
- **Real sprite atlases**, not circles. 16 strips of 64×64 frames, tinted per family
  with a `source-in` composite so one atlas serves every realm's accent colours.
- **A volumetric fog layer** between the artwork and the particles, so the ambience
  is seen through haze rather than pasted on top of it.
- **A now-playing surface** beside the realm name, with play/pause, next and close.
- **An ambient screensaver** — the chrome dissolves, the clock grows into the corner
  and the wallpaper becomes the screen.

## The ambience engine

`src/engine/ambience.ts` is a direct port of the Android renderer's ambience layer
(`AnimeBackdropView.java`). The families, the atlases, the per-family drift and the
fog planes are the same, so the ambience here is the ambience the set-top box draws.

| | |
|---|---|
| **Families** | starlight · sakura · cyber rain · embers · floaties · hearts · snow · leaves · bubbles · fog · fireflies · rain · feathers · aurora · smoke · shooting stars · dandelion · butterflies · confetti |
| **Sprites** | Kenney's CC0 *Particle Pack*, *Foliage Sprites* and *Smoke Particles*, plus petals, snowflakes, butterflies and feathers generated for the families no pack covers |
| **Layering** | artwork → realm scrim → volumetric fog → particles |
| **Tinting** | `source-in` composite against the realm's accent, so a single atlas serves every realm |

**Smoke is deliberately not a sprite**, on either platform. A smoke sprite is a solid
puff and reads as cotton wool. Both renderers build a rising column of five soft
gradient blobs instead — widest and faintest at the top, tightest at the core, with
no edge anywhere.

## Driving it

The control deck (bottom left) is live: change the ambience family, the particle
mode, the fog, shuffle the wallpapers, or drop into the ambient screensaver.

| key | |
|---|---|
| `←` `→` | switch realm |
| `space` | play / pause |
| `N` | next track |
| `A` | ambient screensaver |
| `S` | shuffle the wallpapers |
| `D` | control deck |

## The Android build

The television build is the source of truth for the engine; this port mirrors it.

- Package `com.skii.os`, label **Skii OS**, APK `Skii-OS-v2.0.0.apk`.
- **58 realms** with per-realm accent colours sampled from the artwork.
- **A NotificationListenerService** feeds the now-playing strip. `MEDIA_CONTENT_CONTROL`
  is `signature|privileged` on this firmware, so a notification listener is the only
  route a third-party launcher has to another app's media session.
- **The home screen is the screensaver.** Skii OS registers as the system dream, so
  the wallpaper becomes the screen with the clock enlarged in the corner.
- **The boot animation and the bootloader logo could not be replaced.** Android 14's
  bootanimation service searches only `/apex/com.android.bootanimation`, `/product`,
  `/oem` and `/system` — all read-only dm-verity mounts on a locked bootloader, and
  the old `/data/local/bootanimation.zip` fallback no longer exists. The packages
  are built in the exact format the firmware expects, ready for a bootloader unlock.

## Code map

- `src/engine/ambience.ts` — the ambience engine: families, atlases, drift, fog.
- `src/engine/realms.ts` — the manifest loader and the shuffled realm order.
- `src/components/Backdrop.tsx` — the 1280×720 canvas: artwork, scrim, fog, particles.
- `src/components/ControlDeck.tsx` — the live controls.
- `src/App.tsx` — the television shell: navigation, realm header, mini player, hero
  row, shelves and the ambient screensaver.
- `public/realms.json`, `public/wallpapers/`, `public/sprites/` — the same assets the
  APK ships.

## Notes

- The stage is a fixed 1280×720 canvas (the panel's native UI resolution), scaled to
  fit the window, so the layout is pixel-identical to the television at every size.
- Wallpaper artwork is anime key art used as launcher backgrounds. It is a personal
  project; the artwork is not the author's and is not licensed for redistribution.
- The sprite atlases are CC0 (Kenney.nl). The generated sprites are original.
