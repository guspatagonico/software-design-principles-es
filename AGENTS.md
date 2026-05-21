# AGENTS.md

## Project

Spanish-language static reference site covering 12 software design principles. Built with **Astro 6.3** in SSG mode, deployed at `https://principles.gustavosalvini.com.ar/`, local dev at `http://localhost:4321/`.

## Current phase

- **Phase 1 (complete):** Modular static build script (removed; cleared after Phase 2 migration).
- **Phase 2 (complete):** Astro 6.3 migration. All pages render via Astro content collections and `.astro` components.
- `_seed/` is the **prototype** — reference material, never edit it.

## Stack

- **Astro 6.3** — static output (`output: 'static'`)
- **`pnpm`** — package manager (do NOT use npm)
- **Zod** — content schema validation
- **CSS Modules pattern** (plain `.css`, imported via Astro)
- **No React in production pages** (reserved for future interactive features)

## Project structure

```
scripts/
├── gen-og-images.mjs     # Prebuild script: generates per-page JPG OG images
src/
├── components/           # Reusable .astro components
│   ├── ContextSection.astro   # Origin + scope block
│   ├── ProgressNav.astro      # Bottom prev/next + progress dots
│   ├── SiteNav.astro          # Fixed top/bottom SNAV bars
│   └── TabNav.astro           # Tab bar with animated pill
├── content/
│   └── principle/        # 12 JSON data files (content collection)
├── data/
│   └── accents.mjs       # Centralized ACCENT_HEX map, rgba(), accentStyle()
├── layouts/
│   └── BaseLayout.astro  # HTML shell + SEO meta tags + OG + Twitter Cards + JSON-LD
├── pages/
│   ├── index.astro       # Landing page (card grid + reading strip)
│   └── principios/
│       └── [slug].astro  # Dynamic route for all 12 principles
├── styles/
│   ├── base.css          # Reset, fonts, all 12 accent palettes, breakpoints
│   └── layout.css        # All shared component styles (SNAV, tabs, panels, cards)
└── content.config.ts     # Glob loader + Zod schema (includes description field)
public/
├── favicon.svg           # "PDS" logo in dark square, hexagonal cyan (#67e8f9)
├── robots.txt            # Allows all crawlers, points to sitemap
├── js/
│   └── tabs.js           # Shared tab-nav script (keyboard, pill, dots)
└── og/                   # Generated at prebuild — 13 JPG OG images (1200×630)
```

## Content flow

1. **Data source:** 12 JSON files in `src/content/principle/` — one per principle.
2. **Schema:** `src/content.config.ts` validates via `defineCollection` + `glob` loader + Zod.
3. **Pages:** `[slug].astro` calls `getCollection('principle')` → renders each principle page.
4. **Index:** `index.astro` loads the same collection for card metadata; reads `data/index.json` for intro text.
5. **Components:** `[slug].astro` delegates to `SiteNav.astro`, `TabNav.astro`, `ProgressNav.astro`, `ContextSection.astro`.

## Accent color system

- **Central map:** `src/data/accents.mjs` exports `ACCENT_HEX` (12 principles + index neutral) and helpers `rgba(hex, alpha)` / `accentStyle(accent, alphaBg, alphaBorder)`.
- **CSS palettes:** `src/styles/base.css` defines `[data-accent="kiss"]`, `[data-accent="solid"]`, etc. with full `--bg`, `--surface`, `--text`, `--muted`, `--accent`, `--accent-r`, `--accent-rb` plus page-specific special vars (SOLID tabs, SoC `--what`/`--how`/`--when`, Info Hiding `--pub`/`--priv`/`--iface`, etc.).
- **Injection:** `BaseLayout.astro` sets `data-accent` on `<body>`. Components use `accentStyle()` for inline link colors.

## SEO / GEO metadata system

- **Hub:** `BaseLayout.astro` is the single source for all page metadata. Every page passes `title`, `description`, `accent`, `image`, `canonicalURL`, `type`, and `jsonLd` as props.
- **Meta tags generated:** `<meta name="description">`, `<link rel="canonical">`, full OGP (og:title, og:description, og:type, og:url, og:image 1200×630, og:site_name, og:locale=es_ES), Twitter Cards (summary_large_image), and JSON-LD structured data.
- **JSON-LD schemas:** Index uses `WebSite`; principle pages use `TechArticle` with author `@guspatagonico`.
- **Canonical URLs:** Index → `https://principles.gustavosalvini.com.ar/`, principles → `https://principles.gustavosalvini.com.ar/principios/{slug}/`.
- **Sitemap:** `@astrojs/sitemap` integration in `astro.config.mjs` generates `sitemap-index.xml`.
- **Robots.txt:** Allows all crawlers, points to `https://principles.gustavosalvini.com.ar/sitemap-index.xml`.
- **Favicon:** `public/favicon.svg` — dark square with "PDS" logo, hexagonal cyan (#67e8f9).
- **Descriptions:** Added as optional `z.string()` to content schema; populated in all 12 JSON files from `cardDesc`/`headerSubtitle`.

## OG image generation

- **Script:** `scripts/gen-og-images.mjs` — runs before every build via `package.json` `"prebuild"`.
- **Tech:** Uses `sharp` (already in deps) to rasterize parametrized SVG templates → JPG (1200×630, quality 90).
- **Per-page uniqueness:** Each principle gets its own image with its accent color, `navLabel` (big) + `cardTitle` (subtitle).
- **Design (all images):**
  - Dark gradient background (`#0a0a0a` → `#161616`)
  - 5px accent-colored left bar (15% opacity)
  - "PDS" logo box (top-left, 44×44, accent-colored)
  - "Principios de Diseño de Software" site title
  - Principle name in accent color (72px, bold, centered)
  - Principle subtitle in gray (31px)
  - "Una guía de referencia para developers" (21px)
  - Divider line + `https://github.com/guspatagonico` (20px)
- **Output:** `public/og/{slug}.jpg` (12) + `public/og/index.jpg` (1).
- **Image reference:** `BaseLayout.astro` default is `og/index.jpg`; `[slug].astro` passes `og/{page.slug}.jpg`.
- **Accent colors:** Inlined from `ACCENT_HEX` in the script (same values as `src/data/accents.mjs`).
- **SVG text:** Uses `font-family="system-ui,-apple-system,sans-serif"`; `&amp;` entities in JSON must remain un-decoded for valid XML.

## Build pipeline

- **Prebuild:** `node scripts/gen-og-images.mjs` → generates 13 JPGs in `public/og/`.
- **Build:** `pnpm astro build` → copies `public/` to `dist/`, builds all static routes, generates sitemap.
- **Output:** 13 HTML pages + sitemap-index.xml + og/ JPGs in `dist/`.
- **Dev:** `pnpm astro dev` (does NOT run prebuild; OG images must exist from a prior build).

## Key patterns

- **Base URL:** Use `import.meta.env.BASE_URL` (not `Astro.base`, which is undefined in template expressions). Always normalize trailing slash: `link.replace(/\/$/, '')`.
- **Script loading:** `public/js/tabs.js` loaded with `is:inline` to preserve its plain-JS nature.
- **Build:** `pnpm astro build` → `dist/` output, `pnpm astro dev` for local dev.
- **Width variants:** JSON `width: "standard"` → `max-width: 900px`, `"wide"` → `960px`.

## Architecture requirements (met)

- DRY ✓ — shared `base.css` + `layout.css`, no duplicated styles across pages.
- SoC ✓ — HTML (.astro) / CSS (.css) / JS (.js) in separate files.
- Low coupling ✓ — components accept props, don't depend on page-specific content.
- CSS vars once ✓ — all accent palettes in `base.css`, injected via `data-accent` attribute.
- Shared tab script ✓ — `public/js/tabs.js` auto-detects tab count from DOM.

## Page phases (reading order)

1. **Mindset** — KISS (01), YAGNI (02), DRY (03)
2. **Code Design** — SOLID (04), SoC (05), Information Hiding (06), Law of Demeter (07), Fail Fast (08)
3. **Module Design** — Package Principles (09)
4. **Architecture** — Screaming Architecture (10), Clean Architecture (11), Hexagonal (12)

## Seed reference

- `_seed/00_index.html` — landing page with card grid (4 phases) and reading-order strip.
- `_seed/01_kiss-principle.html` through `_seed/12_hexagonal-architecture.html` — one page per principle.
- Page template: header → tabbed nav (Concepto / En el código / Reglas / Trampas) → origin+scope context → fixed top/bottom snav bars.
- All pages use `zoom: 1.3` on `html`.
- Google Fonts: DM Mono, Fraunces, DM Sans.

<!-- gitnexus:start -->

# GitNexus — Code Intelligence

This project is indexed by GitNexus as **software-design-principles-es** (24 symbols, 21 relationships, 0 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource                                                       | Use for                                  |
| -------------------------------------------------------------- | ---------------------------------------- |
| `gitnexus://repo/software-design-principles-es/context`        | Codebase overview, check index freshness |
| `gitnexus://repo/software-design-principles-es/clusters`       | All functional areas                     |
| `gitnexus://repo/software-design-principles-es/processes`      | All execution flows                      |
| `gitnexus://repo/software-design-principles-es/process/{name}` | Step-by-step execution trace             |

## CLI

| Task                                         | Read this skill file                                        |
| -------------------------------------------- | ----------------------------------------------------------- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md`       |
| Blast radius / "What breaks if I change X?"  | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?"             | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md`       |
| Rename / extract / split / refactor          | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md`     |
| Tools, resources, schema reference           | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md`           |
| Index, status, clean, wiki CLI commands      | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md`             |

<!-- gitnexus:end -->
