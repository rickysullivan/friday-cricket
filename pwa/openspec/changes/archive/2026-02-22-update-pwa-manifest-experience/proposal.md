# Change: Update PWA manifest for app-like install experience

## Why
The current PWA manifest is installable but minimal, which leaves app-like polish on the table across Android, desktop, and iOS. We need a deliberate manifest strategy covering identity, icons, splash behavior, and chrome colors so installs feel like a first-class app.

## What Changes
- Define a complete manifest member strategy based on MDN/web.dev guidance, including which members we adopt now, defer, or reject with rationale.
- Expand manifest metadata for stable app identity (`id`), richer install surfaces (icons, screenshots, shortcuts), and stronger app window behavior.
- Standardize icon and launch assets (including maskable icons and screenshot assets) so splash and launcher presentation are consistent.
- Align browser chrome and launch colors by keeping manifest and HTML theme/background values consistent across install and runtime contexts.
- Document platform-specific constraints (for example, iOS splash behavior) and required fallback metadata where manifest support is incomplete.

## Impact
- Affected specs: `pwa-manifest-experience`
- Affected code: `vite.config.js`, `index.html`, `public/` PWA image assets, and PWA setup documentation
