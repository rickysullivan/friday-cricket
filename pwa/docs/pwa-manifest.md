# PWA Manifest Guide

This project uses `vite-plugin-pwa` to generate the web app manifest from `vite.config.js`.

## Goals
- Keep installability reliable across Chromium, Firefox, and Safari/iOS.
- Make install surfaces feel app-like (icons, splash/launch visuals, and chrome colors).
- Keep behavior stable when deploying under a non-root base path.

## Current Sources of Truth
- Manifest config: `vite.config.js`
- Runtime metadata fallbacks: `index.html`
- Manifest assets: `public/`

## Member Inventory (MDN Reference)

Decision states:
- `Adopt`: implemented now.
- `Defer`: intentionally postponed.
- `Not applicable`: not relevant for current product shape.

| Member | Decision | Why |
|---|---|---|
| `name` | Adopt | Full install identity in launcher and install UI. |
| `short_name` | Adopt | Better fit where launcher labels are truncated. |
| `description` | Adopt | Improves richer install prompts in supporting browsers. |
| `icons` | Adopt | Required for installability and launcher/splash rendering. |
| `id` | Adopt | Stable install identity independent of `start_url` changes. |
| `start_url` | Adopt | Explicit app launch entry. |
| `scope` | Adopt | Keeps in-scope navigation in installed app window. |
| `display` | Adopt | App-like standalone experience. |
| `orientation` | Adopt | Portrait-first launch behavior. |
| `theme_color` | Adopt | Aligns browser and app window chrome color. |
| `background_color` | Adopt | Placeholder/splash background on supporting platforms. |
| `screenshots` | Adopt | Enables richer install UIs where supported. |
| `shortcuts` | Adopt | App-like quick actions from app icon/context menu. |
| `categories` | Adopt | Helpful install metadata with low compatibility risk. |
| `display_override` | Defer | Experimental support with limited practical value today. |
| `launch_handler` | Defer | Experimental; not needed for current single-window use. |
| `note_taking` | Defer | Experimental and unrelated to scorekeeping workflows. |
| `share_target` | Defer | Requires share-ingestion flow not implemented yet. |
| `file_handlers` | Defer | Requires file contract and import UX decisions. |
| `protocol_handlers` | Adopt | Enables installed app handoff for `web+wickety://` links on supporting browsers. |
| `scope_extensions` | Defer | Experimental and no cross-origin scope requirement. |
| `related_applications` | Not applicable | No native/store companion apps exist. |
| `prefer_related_applications` | Not applicable | No related app target to prefer. |
| `serviceworker` | Not applicable | Non-standard; service worker is controlled by Workbox/VitePWA config. |
| `lang` | Adopt (tool default) | `vite-plugin-pwa` emits `lang: "en"`; we keep plugin default unless localization requires changes. |

Additional documented members with limited practical support in our target matrix:
- `dir`: deferred until explicit RTL/language direction requirements.
- `iarc_rating_id`: deferred until ratings/compliance requires it.

## Asset Requirements
- Standard icons: at least `192x192` and `512x512` PNG.
- Additional high-res icon: `1024x1024` PNG.
- Maskable icons: `512x512` and `1024x1024` PNG with center-safe artwork padding.
- Screenshots: at least one narrow (`form_factor: narrow`) and one wide (`form_factor: wide`) PNG.

## Platform Notes
- Android/Chromium splash visuals are generated from manifest colors and icons.
- iOS/iPadOS does not generate splash screens from manifest fields; keep Apple fallback tags and touch icon in `index.html`.

## Shortcut Deep Links
- `?intent=start` opens match setup from the welcome screen.
- `?intent=watch` opens spectator join flow from the welcome screen (when sync is configured).
- Existing `?watch=<GAME_ID>` links continue to deep-link directly into spectator join behavior.

## Custom Protocol Links
- Manifest registers `web+wickety` via `protocol_handlers`.
- Supported examples:
  - `web+wickety://start`
  - `web+wickety://watch/AB12CD`
  - `web+wickety://watch?game=AB12CD`
- On supporting browsers/OS combinations, links can launch the installed PWA; unsupported platforms safely ignore this manifest field.

## Maintenance Rules
1. Keep manifest `id`, `start_url`, and `scope` aligned with `VITE_BASE_PATH` handling.
2. Update `includeAssets` whenever adding/removing manifest-referenced files.
3. If a manifest member decision changes, update this document and the OpenSpec design matrix together.
4. After manifest edits, run `bun run build` and verify:
   - `dist/manifest.webmanifest` is generated.
   - all referenced icon/screenshot files exist in `dist/`.
5. Validate in Chromium DevTools Application > Manifest and ensure no critical installability issues.
