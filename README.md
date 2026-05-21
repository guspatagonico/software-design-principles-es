# Principios de Diseño de Software

Guía de referencia con **12 principios de diseño de software** organizados por orden de aplicación en el ciclo de vida de un proyecto —desde las decisiones más tempranas hasta las más arquitectónicas. Sitio estático en español, construido con **Astro 6.3**.

**[`principles.harness.ar`](https://principles.harness.ar/)**

---

## ¿Para qué existe este proyecto?

Este es un **proyecto personal pero abierto**. Cualquier developer puede forkearlo, mejorarlo o usarlo como base para su propia referencia de principios de diseño.

Hoy los desarrolladores necesitan absorber cada vez más información en menos tiempo: configurar ambientes, armar harnesses de coding asistido con agentes de IA, escribir prompts efectivos. Este sitio condensa **fundamentos sólidos de diseño de software** que enriquecen el prompt engineering y sirven como material de referencia para cualquier harness de desarrollo.

Estoy abierto a **feedback, correcciones y sugerencias**. Si algo no se entiende, es incorrecto o podría estar mejor, abrí un issue o mandá un PR.

---

## Estructura de contenido

Los 12 principios están organizados en **4 fases de lectura**, que reflejan el orden natural en que se aplican durante el desarrollo:

| Fase | Enfoque | Principios |
|------|---------|------------|
| **1 · Mindset** | Actitudes de diseño que deben estar internalizadas antes de escribir código | KISS, YAGNI, DRY |
| **2 · Diseño de código** | Cómo diseñar clases, funciones y módulos testeables y mantenibles | SOLID, SoC, Information Hiding, Law of Demeter, Fail Fast |
| **3 · Diseño de módulos** | Cómo agrupar código en paquetes, módulos o servicios | Package Principles |
| **4 · Arquitectura** | Decisiones estructurales del sistema completo | Screaming Architecture, Clean Architecture, Hexagonal |

Cada página de principio tiene 4 secciones con pestañas: **Concepto**, **En el código**, **Reglas** y **Trampas**, más un bloque de origen y alcance.

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Framework | [Astro 6.3](https://astro.build) — SSG (`output: 'static'`) |
| Package manager | **pnpm** (no usar npm) |
| Validación de datos | Zod (content schema) |
| Estilos | CSS plano con variables y data-attributes (sin preprocesadores) |
| SEO / OG | Open Graph, Twitter Cards, JSON-LD (TechArticle, WebSite), sitemap automático |
| OG images | Script con `sharp` que genera imágenes JPG 1200×630 por principio |
| JS del lado cliente | `public/js/tabs.js` (vanilla, cargado con `is:inline`) |

React está instalado como dependencia para funcionalidades interactivas futuras, pero las páginas de producción actuales no lo usan.

---

## Estructura del proyecto

```
scripts/
└── gen-og-images.mjs          # Prebuild: genera 13 OG images JPG con sharp
src/
├── components/                # Componentes .astro reutilizables
│   ├── ContextSection.astro   # Bloque de origen y alcance
│   ├── ProgressNav.astro      # Navegación inferior prev/next + dots de progreso
│   ├── SiteNav.astro          # Barras fijas superior/inferior (SNAV)
│   └── TabNav.astro           # Pestañas con pill animado
├── content/
│   └── principle/             # 12 archivos JSON — uno por principio (content collection)
├── data/
│   └── accents.mjs            # Mapa ACCENT_HEX, helpers rgba() y accentStyle()
├── layouts/
│   └── BaseLayout.astro       # Shell HTML + metadatos SEO/OG/Twitter/JSON-LD
├── pages/
│   ├── index.astro            # Landing page: grilla de cards + orden de lectura
│   └── principios/
│       └── [slug].astro       # Ruta dinámica para los 12 principios
├── styles/
│   ├── base.css               # Reset, fuentes, 12 paletas de acento, breakpoints
│   └── layout.css             # Estilos compartidos: SNAV, tabs, panels, cards
└── content.config.ts          # Glob loader + schema Zod
public/
├── favicon.svg
├── robots.txt
├── js/
│   └── tabs.js                # Script de pestañas (keyboard, pill, dots)
└── og/                        # Generado en prebuild — 13 JPGs (1200×630)
_seed/                         # Prototipo original — material de referencia, NO editar
```

---

## Cómo levantar el proyecto localmente

```bash
# 1. Clonar e instalar dependencias
git clone https://github.com/guspatagonico/software-design-principles-es.git
cd software-design-principles-es
pnpm install

# 2. Generar imágenes OG (necesario una vez, y antes de cada build)
pnpm prebuild

# 3. Desarrollo local
pnpm dev
# → http://localhost:4321/

# 4. Build de producción
pnpm build
# → output en dist/
```

---

## Cómo contribuir

### Agregar un nuevo principio

1. Creá un archivo JSON en `src/content/principle/` con el slug como nombre (ej. `my-principle.json`).
2. Completalo siguiendo el schema definido en `src/content.config.ts`. Campos requeridos: `slug`, `title`, `accent`, `position`, `tabs`.
3. Agregá la entrada al mapa `ACCENT_HEX` en `src/data/accents.mjs`.
4. Definí la paleta CSS en `src/styles/base.css` con `[data-accent="my-principle"]`.
5. Ejecutá `pnpm prebuild` para regenerar las imágenes OG.
6. La página se genera automáticamente en `/principios/my-principle/` — Astro resuelve el slug desde la content collection.

### Modificar el contenido de un principio existente

Editá el archivo JSON correspondiente en `src/content/principle/`. El HTML de los tabs va dentro del campo `content` de cada tab. No hace falta tocar ningún `.astro`.

### Agregar una nueva sección o funcionalidad

- **Componentes visuales:** Creá un `.astro` en `src/components/` y usalo desde `[slug].astro` o `index.astro`. Los estilos van en `src/styles/layout.css`.
- **Scripts del lado cliente:** Agregalos en `public/js/`, cargalos con `is:inline` en `BaseLayout.astro`.
- **Metadatos SEO:** Todo se centraliza en `BaseLayout.astro`. Si necesitás nuevos metatags, agregalos ahí y pasá las props desde las páginas.
- **Nuevas rutas:** Agregá archivos `.astro` en `src/pages/`. Astro genera una ruta por cada archivo.

### Convenciones del proyecto

- **`pnpm`** como package manager. No uses npm ni yarn.
- **Tabs** para indentación.
- HTML en `.astro`, CSS en `.css`, JS en `.js` — separación estricta de concerns.
- CSS via data-attributes (`[data-accent="kiss"]`) y variables — sin CSS-in-JS ni preprocesadores.
- Nombres de variables descriptivos, camelCase.
- `_seed/` es material de referencia del prototipo original — nunca se edita.
- **El feedback también es contribución.** Si encontrás un error, algo que no se entiende o tenés una mejora, abrí un issue.

---

## Sistema de colores de acento

Cada principio tiene un color de acento único, definido en tres lugares que deben mantenerse sincronizados:

| Archivo | Propósito |
|---------|-----------|
| `src/data/accents.mjs` | Mapa `ACCENT_HEX` y helpers `rgba()` / `accentStyle()` |
| `src/styles/base.css` | Paleta CSS completa con `--bg`, `--surface`, `--text`, `--muted`, `--accent`, etc. |
| `scripts/gen-og-images.mjs` | Color inline para las imágenes Open Graph |

El atributo `data-accent` se inyecta en `<body>` desde `BaseLayout.astro`. Los componentes usan `accentStyle()` para colores inline.

---

## Build y deploy

```bash
pnpm prebuild   # node scripts/gen-og-images.mjs → 13 JPGs en public/og/
pnpm build      # pnpm astro build → dist/ con HTML + sitemap + assets
```

El sitio se deploya como carpeta estática. El sitemap se genera automáticamente via `@astrojs/sitemap`. Las imágenes OG deben existir en `public/og/` antes del build; `pnpm dev` no las regenera.

---

## Autor y comunidad

**Gustavo Adrián Salvini** — [@guspatagonico](https://github.com/guspatagonico)

- GitHub: [`github.com/guspatagonico`](https://github.com/guspatagonico)
- Blog: [`gustavosalvini.com.ar`](https://gustavosalvini.com.ar)
- Redes sociales: `@guspatagonico`

¿Tenés una idea, encontraste un error o querés mejorar algo? El repo está abierto: [issues y pull requests](https://github.com/guspatagonico/software-design-principles-es) son bienvenidos.
