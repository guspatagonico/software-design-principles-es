# AGENTS.md

## Project
Spanish-language static reference site covering 12 software design principles. Currently rebuilding from a prototype into a modular, professional version.

## Current phase
- `_seed/` is a **prototype** — self-contained HTML files (inline CSS/JS, zero dependencies). Content and visual design are correct; structure is throwaway.
- **Goal:** produce a clean HTML/CSS/JS version with proper separation of concerns, reusable components, and no duplication. The seed is reference material — never edit it.

## Architecture requirements
- DRY: extract shared styles (CSS vars, nav bars, typography, layout) into shared files. Each page should only carry principle-specific content and its accent color.
- SoC: HTML / CSS / JS in separate files (or a clear module structure). No more monolithic inline-everything.
- Low coupling, high cohesion: shared nav and layout should not depend on page-specific content.
- CSS vars defined once, imported everywhere. Per-principle accent colors injected via a mechanism that doesn't force CSS duplication.
- Tab navigation script in a single shared file, not copy-pasted 12 times.

## Future
This HTML/CSS/JS version will likely evolve into a more complex stack (static site generator, framework, etc.). Keep the codebase structure simple and obvious so migration is low-friction.

## Seed reference
- `_seed/00_index.html` — landing page with card grid (4 phases) and reading-order strip.
- `_seed/01_kiss-principle.html` through `_seed/12_hexagonal-architecture.html` — one page per principle.
- Page template: header → tabbed nav (Concepto / En el código / Reglas / Trampas) → origin+scope context → fixed top/bottom snav bars.
- All pages use `zoom: 1.3` on `html`.
- Google Fonts: DM Mono, Fraunces, DM Sans.

## Page phases (reading order)
1. **Mindset** — KISS (01), YAGNI (02), DRY (03)
2. **Code Design** — SOLID (04), SoC (05), Information Hiding (06), Law of Demeter (07), Fail Fast (08)
3. **Module Design** — Package Principles (09)
4. **Architecture** — Screaming Architecture (10), Clean Architecture (11), Hexagonal (12)
