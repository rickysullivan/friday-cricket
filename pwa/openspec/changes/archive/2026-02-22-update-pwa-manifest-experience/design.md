## Context
The app already uses `vite-plugin-pwa` and exposes a minimal manifest with `name`, `short_name`, `icons`, `start_url`, `scope`, `display`, `theme_color`, `background_color`, and `orientation`. Users now want an explicitly app-like install experience with polished launcher assets, splash behavior, and UI chrome color consistency.

Two source references drive this change:
- MDN manifest reference (member catalog and support notes).
- web.dev Learn PWA manifest guidance (install UX and practical member priorities).

## Goals / Non-Goals
- Goals:
  - Define an explicit decision table for all MDN-listed manifest members.
  - Improve install-time and launch-time app polish using manifest-supported fields and assets.
  - Keep runtime theme/chrome colors consistent between manifest and HTML metadata.
  - Preserve offline-first behavior and existing routing/base-path behavior.
- Non-Goals:
  - Implement capability APIs that require backend endpoints or new product features (for example `share_target`, `file_handlers`, `protocol_handlers`).
  - Change core scoring workflows, sync architecture, or service worker caching strategy beyond manifest-related asset additions.

## Decisions
- Decision: Use a "tiered manifest" approach.
  - Tier 1 (required/core): `name`, `short_name`, `icons`, `start_url`, `scope`, `display`, `id`.
  - Tier 2 (recommended UX): `theme_color`, `background_color`, `orientation`, `description`, `screenshots`, `shortcuts`, optional `categories`.
  - Tier 3 (deferred/experimental): fields with weak support or product mismatch (`display_override`, `launch_handler`, `share_target`, `file_handlers`, `protocol_handlers`, `related_applications`, `prefer_related_applications`, `scope_extensions`, `note_taking`, `serviceworker`).
- Decision: Treat splash screens as platform-specific.
  - Android/Chromium splash appearance is driven by manifest icon/color fields.
  - iOS splash screens are not manifest-driven; use explicit fallback metadata/assets where needed.
- Decision: Keep app identity stable via `id` independent from future `start_url` adjustments.

## Manifest Member Decision Matrix

| Member | Decision | Phase | Rationale |
|---|---|---|---|
| `name` | Adopt | Phase 1 | Required core identity for install surfaces. |
| `short_name` | Adopt | Phase 1 | Improves launcher label fit on constrained UI. |
| `description` | Adopt | Phase 1 | Enables richer install prompt metadata where supported. |
| `icons` | Adopt | Phase 1 | Required for installability and launcher/splash fidelity. |
| `id` | Adopt | Phase 1 | Stabilizes install identity across future URL changes. |
| `start_url` | Adopt | Phase 1 | Controls app launch entry and install context. |
| `scope` | Adopt | Phase 1 | Keeps in-scope navigation in app window. |
| `display` | Adopt | Phase 1 | Delivers standalone app window behavior. |
| `orientation` | Adopt | Phase 1 | Locks intended portrait-first app experience. |
| `theme_color` | Adopt | Phase 1 | Aligns browser/app chrome color on supported platforms. |
| `background_color` | Adopt | Phase 1 | Used in launch/splash placeholders on supporting platforms. |
| `screenshots` | Adopt | Phase 2 | Enables richer install UI and listing surfaces. |
| `shortcuts` | Adopt | Phase 2 | Adds quick actions to improve app-like entry points. |
| `categories` | Adopt | Phase 2 | Helpful app taxonomy metadata; low risk. |
| `display_override` | Defer | Backlog | Experimental support; keep until clear browser value. |
| `launch_handler` | Defer | Backlog | Experimental; unnecessary for single-window baseline. |
| `note_taking` | Defer | Backlog | Experimental and not aligned to scorekeeping workflows. |
| `share_target` | Defer | Backlog | Requires share ingestion UX/flows not in this scope. |
| `file_handlers` | Defer | Backlog | Requires file contract design and validation paths. |
| `protocol_handlers` | Adopt | Phase 2 | Enables installed-app handoff for supported `web+` links with low implementation overhead. |
| `related_applications` | Not applicable | N/A | No native/store companion app exists today. |
| `prefer_related_applications` | Not applicable | N/A | No related apps to prefer over web install. |
| `scope_extensions` | Defer | Backlog | Experimental; no cross-origin scope need currently. |
| `serviceworker` | Not applicable | N/A | Non-standard manifest member; service worker is managed via VitePWA/Workbox config. |

Notes:
- `dir`, `lang`, and `iarc_rating_id` are documented but currently have limited/partial implementation support; we leave them out of manifest output until product localization or ratings policy requires them.
- iOS/iPadOS splash screens are not generated from manifest fields; fallback behavior is handled in HTML metadata/assets documentation.

## Apply-Stage Checklist (Adopted Members)

Use this checklist during implementation to ensure each adopted member is wired to the expected location.

### Manifest object in `vite.config.js`
- [ ] `manifest.name` set to product display name.
- [ ] `manifest.short_name` set to launcher-friendly label.
- [ ] `manifest.description` set to concise install-surface copy.
- [ ] `manifest.id` set to stable base-path-safe app identifier.
- [ ] `manifest.start_url` set to base-path-safe launch URL.
- [ ] `manifest.scope` set to base-path-safe in-app navigation scope.
- [ ] `manifest.display` set to app-like window mode (`standalone` unless explicitly changed).
- [ ] `manifest.orientation` set to intended default orientation.
- [ ] `manifest.theme_color` set to primary app chrome color.
- [ ] `manifest.background_color` set to launch/splash placeholder color.
- [ ] `manifest.icons` includes:
  - [ ] At least one standard icon entry (`purpose` omitted or `any`).
  - [ ] At least one `purpose: "maskable"` icon entry.
  - [ ] Recommended high-resolution sizes (minimum 192 and 512, plus additional if provided).

### Optional richness fields in `vite.config.js` (Phase 2)
- [ ] `manifest.screenshots` references valid screenshot assets in `public/` with correct dimensions/types.
- [ ] `manifest.shortcuts` includes app actions mapped to valid in-scope URLs.
- [ ] `manifest.categories` (if included) uses lowercase, standards-aligned values.

### Asset files under `public/`
- [ ] Standard launcher icons exist and match `manifest.icons` `src` values.
- [ ] Maskable icon exists, has adequate safe-zone padding, and matches `manifest.icons`.
- [ ] Screenshot images exist and match `manifest.screenshots` entries.
- [ ] Asset filenames are stable and referenced consistently from manifest config.

### Runtime metadata in `index.html`
- [ ] `<meta name="theme-color">` matches manifest `theme_color` or intentional light/dark overrides.
- [ ] Apple fallback tags remain consistent with manifest branding for iOS/iPadOS.
- [ ] `<link rel="apple-touch-icon">` points to current install icon asset.

### Verification gates
- [ ] Build output contains generated manifest and all referenced files.
- [ ] Chromium DevTools Application > Manifest shows no critical installability errors.
- [ ] Manual install check confirms launcher icon quality, splash/launch polish, and chrome color consistency.

### Alternatives considered
- Keep only minimal manifest and rely on defaults.
  - Rejected: does not meet the requested "app-like" quality bar.
- Adopt every MDN member immediately.
  - Rejected: introduces unsupported/experimental behavior with low product value and higher maintenance cost.

## Risks / Trade-offs
- Asset bloat risk from additional icons/screenshots -> Mitigate by defining required dimensions and optimized image compression.
- Cross-browser variance (especially iOS) -> Mitigate with explicit support matrix and documented fallback behavior.
- Manifest drift over time -> Mitigate with a maintenance checklist and ownership notes in docs.

## Migration Plan
1. Add member decision matrix and target manifest shape.
2. Produce required assets and wire fields.
3. Align HTML metadata and platform fallbacks.
4. Validate installability and visual outcomes on supported devices.

Rollback: revert manifest field additions and new assets while keeping existing installable baseline configuration.

## Open Questions
- None. This proposal assumes we prioritize stable cross-browser fields first and defer experimental members unless explicitly requested.
