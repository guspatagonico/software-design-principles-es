import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');
const TEMPLATE_DIR = join(__dirname, 'templates');
const OUT_DIR = join(__dirname, 'principios');
const INDEX_OUT = join(__dirname, 'index.html');

const ACCENT_HEX = {
	kiss: '#2dd4bf',
	yagni: '#f59e0b',
	dry: '#818cf8',
	solid: '#a78bfa',
	soc: '#fb923c',
	'information-hiding': '#4ade80',
	lod: '#38bdf8',
	'fail-fast': '#f43f5e',
	pkg: '#e879f9',
	'screaming-architecture': '#a3e635',
	'clean-architecture': '#a855f7',
	hexagonal: '#67e8f9',
	index: '#d4d4d8',
};

// ─── Load data ───
const dataFiles = readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
const pages = dataFiles.map(f => {
	const raw = readFileSync(join(DATA_DIR, f), 'utf-8');
	return JSON.parse(raw);
});

pages.sort((a, b) => a.position - b.position);

// Index is position 0
const indexPage = pages.find(p => p.slug === 'index') || { slug: 'index', accent: 'index' };
const principlePages = pages.filter(p => p.slug !== 'index');

// ─── Helpers ───
function rgba(hex, alpha) {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return `rgba(${r},${g},${b},${alpha})`;
}

function snavLink(direction, page, labelOverride) {
	if (!page) {
		// Ghost spacer for index or last page
		return `<div class="snav-ghost"></div>`;
	}
	const arrow = direction === 'prev' ? '←' : '→';
	const label = labelOverride || page.title || page.navLabel || page.slug;
	const hex = ACCENT_HEX[page.accent] || '#d4d4d8';
	const classNames = direction === 'prev' ? 'snav-prev' : 'snav-next';
	const arrowPos = direction === 'prev' ? `<span>${arrow}</span><span class="snav-label">${label}</span>` : `<span class="snav-label">${label}</span><span>${arrow}</span>`;
	const href = page.slug === 'index' ? 'index.html' : `${page.slug}.html`;

	return `<a class="${classNames}" href="${href}" style="color:${hex};background:${rgba(hex, .12)};border-color:${rgba(hex, .32)}">${arrowPos}</a>`;
}

function snavBar(page, pageIndex, totalPages) {
	const isIndex = page.slug === 'index';
	const posLabel = isIndex ? '' : `<span class="snav-pos">${String(pageIndex + 1).padStart(2, '0')}&thinsp;/&thinsp;${String(totalPages).padStart(2, '0')}</span>`;

	if (isIndex) {
		const nextPage = principlePages[0];
		const topNav = `<nav class="snav snav-top">
	<div class="snav-ghost"></div>
	<div class="snav-spacer"></div>
	<div class="snav-center"></div>
	<div class="snav-spacer"></div>
	${snavLink('next', nextPage, nextPage.navLabel || nextPage.title || nextPage.slug)}
</nav>`;
		const botNav = `<nav class="snav snav-bot">
	<div class="snav-ghost"></div>
	<div class="snav-spacer"></div>
	<div class="snav-center"></div>
	<div class="snav-spacer"></div>
	${snavLink('next', nextPage, nextPage.navLabel || nextPage.title || nextPage.slug)}
</nav>`;
		return { top: topNav, bot: botNav };
	}

	const idx = principlePages.indexOf(page);
	const prevPage = idx === 0 ? indexPage : principlePages[idx - 1];
	const nextPage = idx < principlePages.length - 1 ? principlePages[idx + 1] : null;

	const homeLink = `<a class="snav-home" href="../index.html">↑&nbsp;&nbsp;${idx === 0 ? 'Índice de secciones' : 'Índice'}</a>`;

	const top = `<nav class="snav snav-top">
	${snavLink('prev', prevPage, prevPage.navLabel || (prevPage.slug === 'index' ? 'Índice' : prevPage.title))}
	<div class="snav-spacer"></div>
	<div class="snav-center">
		${homeLink}
		${posLabel}
	</div>
	<div class="snav-spacer"></div>
	${snavLink('next', nextPage, nextPage ? (nextPage.navLabel || nextPage.title) : '')}
</nav>`;

	const bot = `<nav class="snav snav-bot">
	${snavLink('prev', prevPage, prevPage.navLabel || (prevPage.slug === 'index' ? 'Índice' : prevPage.title))}
	<div class="snav-spacer"></div>
	<div class="snav-center">
		${homeLink}
		${posLabel}
	</div>
	<div class="snav-spacer"></div>
	${snavLink('next', nextPage, nextPage ? (nextPage.navLabel || nextPage.title) : '')}
</nav>`;

	return { top, bot };
}

function generateTabsHTML(tabs) {
	const hasIcons = tabs.some(t => t.icon);
	return tabs.map((tab, i) => {
		const activeClass = i === 0 ? ' active' : '';
		const colorStyle = tab.tabColorVar ? ` style="--tab-accent: var(${tab.tabColorVar})"` : '';
		const iconHTML = hasIcons
			? `<span class="tab-icon">${tab.icon}</span>`
			: `<span class="tab-letter"${tab.tabColorVar ? ` style="color: var(${tab.tabColorVar})"` : ''}>${tab.letter}</span>`;
		return `<button class="tab-btn${activeClass}" data-idx="${i}"${colorStyle}>
	${iconHTML}
	<span class="tab-word">${tab.label}</span>
</button>`;
	}).join('\n\t\t');
}

function generatePanelsHTML(tabs) {
	return tabs.map((tab, i) => {
		const activeClass = i === 0 ? ' active' : '';
		const letterColor = tab.tabColorVar ? ` style="--letter-color: var(${tab.tabColorVar})"` : '';
		return `<div class="panel${activeClass}" id="panel-${i}">
	${tab.tabColorVar
		? tab.content.replace(/<div class="p-letter">/g, `<div class="p-letter"${letterColor}>`)
		: tab.content
	}
</div>`;
	}).join('\n\n\t');
}

function generateContextHTML(origin, scope) {
	const yesClass = scope.type === 'full' ? 'pill yes' : 'pill partial';
	const scopePills = (scope.pills || []).map(p => `<span class="${yesClass}">${p}</span>`).join('\n\t\t\t');

	return `<div class="context-inner">
	<div>
		<div class="context-section-label">Origen del principio</div>
		<p class="context-text">${origin.description}</p>
	</div>
	<div class="context-divider"></div>
	<div>
		<div class="context-section-label">¿Solo aplica a código?</div>
		<p class="context-text">${scope.description}</p>
		<div class="scope-pills">
			${scopePills}
		</div>
	</div>
</div>`;
}

function generateProgressDots(tabs) {
	return tabs.map((_, i) => {
		const activeClass = i === 0 ? ' active' : '';
		return `<div class="prog-dot${activeClass}"></div>`;
	}).join('\n\t\t');
}

function replace(template, map) {
	let result = template;
	for (const [key, value] of Object.entries(map)) {
		result = result.replaceAll(`{{${key}}}`, value || '');
	}
	return result;
}

// ─── Build principle pages ───
const template = readFileSync(join(TEMPLATE_DIR, 'principio.html'), 'utf-8');

principlePages.forEach((page, idx) => {
	const { top, bot } = snavBar(page, idx, principlePages.length);
	const tabsHTML = generateTabsHTML(page.tabs);
	const panelsHTML = generatePanelsHTML(page.tabs);
	const contextHTML = generateContextHTML(page.origin, page.scope);
	const progressDots = generateProgressDots(page.tabs);
	const widthClass = page.width === 'wide' ? ' class="layout-wide"' : '';

	const html = replace(template, {
		ACCENT: page.accent,
		WIDTH_CLASS: widthClass,
		TITLE: `${page.navLabel || page.title} — Principios de diseño de software`,
		HEADER_LABEL: 'Principios de diseño · Referencia para devs',
		HEADER_TITLE: page.headerTitle || '',
		HEADER_SUBTITLE: page.headerSubtitle || '',
		SNAV_TOP: top,
		SNAV_BOT: bot,
		TABS_HTML: tabsHTML,
		PANELS_HTML: panelsHTML,
		CONTEXT_HTML: contextHTML,
		PROGRESS_DOTS: progressDots,
		FOOTER_LEFT: page.footerLeft || '',
		FOOTER_RIGHT: page.footerRight || 'Gustavo Adrián Salvini · <a href="https://github.com/guspatagonico" target="_blank">@guspatagonico</a>',
	});

	const filename = page.slug === 'index' ? 'index.html' : `${page.slug}.html`;
	writeFileSync(join(OUT_DIR, filename), html);
	console.log(`  ✓ principios/${filename}`);
});

// ─── Build index page ───
// The index page is special — uses different template structure
buildIndexPage(pages);

function buildIndexPage(allPages) {
	const principlePagesSorted = allPages.filter(p => p.slug !== 'index').sort((a, b) => a.position - b.position);
	const { top, bot } = snavBar(indexPage, 0, 0);

	const phases = [
		{ name: 'Fase 1 · Mindset', title: 'Antes de escribir una sola línea', desc: 'Estos tres principios son actitudes de diseño que deben estar internalizadas <strong>antes de tomar cualquier decisión técnica</strong>. Determinan qué construís, cuánto construís y cómo de complejo lo hacés. Ignorarlos al inicio es la causa raíz de la mayoría de la deuda técnica.', phaseClass: 'p1', color: 'var(--p1)', pages: principlePagesSorted.filter(p => p.position >= 1 && p.position <= 3) },
		{ name: 'Fase 2 · Diseño de código', title: 'Cuando diseñás clases y funciones', desc: 'Una vez que sabés qué vas a construir y cuánto, estos cinco principios guían <strong>cómo diseñar las unidades de código</strong>: clases, funciones, módulos. Son los que determinan si el código es testeable, mantenible y resistente al cambio. SOLID es el punto de entrada; los demás son complementos que refuerzan las mismas ideas desde distintos ángulos.', phaseClass: 'p2', color: 'var(--p2)', pages: principlePagesSorted.filter(p => p.position >= 4 && p.position <= 8) },
		{ name: 'Fase 3 · Diseño de módulos', title: 'Cuando el sistema empieza a crecer', desc: 'Una vez que tenés código bien diseñado, necesitás decidir <strong>cómo agrupar ese código en paquetes, módulos o servicios</strong>. Estos principios son SOLID a escala macro: determinan qué poner junto, qué separar y cómo manejar las dependencias entre grupos.', phaseClass: 'p3', color: 'var(--p3)', pages: principlePagesSorted.filter(p => p.position === 9) },
		{ name: 'Fase 4 · Arquitectura', title: 'Cuando diseñás la estructura completa del sistema', desc: 'Las decisiones arquitectónicas son las más costosas de revertir. Estos tres principios se complementan y se aplican juntos: <strong>Screaming Architecture</strong> dice cómo organizar las carpetas, <strong>Clean Architecture</strong> dice cómo manejar las dependencias entre capas, y <strong>Hexagonal</strong> da la implementación práctica concreta.', phaseClass: 'p4', color: 'var(--p4)', pages: principlePagesSorted.filter(p => p.position >= 10 && p.position <= 12) },
	];

	let phaseSections = '';
	for (const phase of phases) {
		const cards = phase.pages.map(p => {
			const hex = ACCENT_HEX[p.accent] || '#d4d4d8';
			const abbrColor = p.indexAbbrColor || hex;
			const indexNum = String(p.position).padStart(2, '0');
			const tabs = p.tabs.map(t => `<span class="card-tab">${t.label}</span>`).join('\n\t\t\t\t');

			return `<a class="card" href="principios/${p.slug}.html">
		<div class="card-top">
			<span class="card-index">${indexNum}</span>
			<span class="card-abbr" style="color:${abbrColor};border-color:${rgba(hex, .3)};background:${rgba(hex, .08)}">${p.indexAbbr || p.navLabel || p.title}</span>
		</div>
		<div class="card-body">
			<div class="card-title">${p.cardTitle || p.title}</div>
			<div class="card-tagline">${p.cardTagline || ''}</div>
			<div class="card-desc">${p.cardDesc || ''}</div>
		</div>
		<div class="card-footer">
			<div class="card-tabs">
				${tabs}
			</div>
			<span class="card-arrow">→</span>
		</div>
	</a>`;
		}).join('\n\n\t\t');

		const gridStyle = phase.pages.length === 1 ? ' cards-grid single-col' : ' cards-grid';

		phaseSections += `
<div class="phase-header">
	<div class="phase-inner">
		<span class="phase-badge" style="color:${phase.color};border-color:${phase.color.replace(')', '.25)')};background:var(--${phase.phaseClass}-r">${phase.name}</span>
		<span class="phase-title">${phase.title}</span>
		<div class="phase-line"></div>
	</div>
	<p class="phase-desc">${phase.desc}</p>
</div>

<div class="cards-wrap">
	<div class="${phase.phaseClass}${gridStyle}">
		${cards}
	</div>
</div>`;
	}

	// Reading order strip
	const rfPhases = [
		{ label: 'Fase 1<br>Mindset', color: 'var(--p1)', pages: principlePagesSorted.filter(p => p.position >= 1 && p.position <= 3) },
		{ label: 'Fase 2<br>Código', color: 'var(--p2)', pages: principlePagesSorted.filter(p => p.position >= 4 && p.position <= 8) },
		{ label: 'Fase 3<br>Módulos', color: 'var(--p3)', pages: principlePagesSorted.filter(p => p.position === 9) },
		{ label: 'Fase 4<br>Arq.', color: 'var(--p4)', pages: principlePagesSorted.filter(p => p.position >= 10 && p.position <= 12) },
	];

	let rfRows = '';
	for (const rf of rfPhases) {
		const chips = rf.pages.map((p, i) => {
			const hex = ACCENT_HEX[p.accent] || '#d4d4d8';
			const arrow = i < rf.pages.length - 1 ? '<span class="rf-arrow">→</span>' : '';
			return `<a class="rf-chip" href="principios/${p.slug}.html" style="color:${hex};border-color:${rgba(hex, .3)};background:${rgba(hex, .06)}">${p.rfLabel || p.navLabel || p.title}</a>${arrow}`;
		}).join('\n\t\t\t\t');

		rfRows += `
	<div class="rf-row">
		<span class="rf-phase-label" style="color:${rf.color}">${rf.label}</span>
		<div class="rf-divider"></div>
		<div class="rf-chips">
			${chips}
		</div>
	</div>`;
	}

	const indexHTML = `<!DOCTYPE html>
<html lang="es" data-accent="index">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Índice — Principios de Diseño de Software</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/layout.css">
</head>
<body>
${top}

<header class="index-header">
	<div class="header-eyebrow">Gustavo Adrián Salvini · @guspatagonico</div>
	<h1><em>Principios de</em><br>Diseño de Software</h1>
	<p class="header-sub">Una guía de referencia para developers. Organizados por <strong>orden de prioridad y aplicabilidad</strong> en el ciclo de vida real de un proyecto —desde las decisiones más tempranas hasta las más arquitectónicas.</p>
	<div class="stats-row">
		<div class="stat">
			<span class="stat-num">12</span>
			<span class="stat-label">principios</span>
		</div>
		<div class="stat">
			<span class="stat-num">4</span>
			<span class="stat-label">fases de aplicación</span>
		</div>
		<div class="stat">
			<span class="stat-num">~60</span>
			<span class="stat-label">ejemplos de código</span>
		</div>
	</div>
</header>
${phaseSections}

<div class="reading-strip">
	<div class="reading-inner">
		<div class="reading-title">Orden de lectura sugerido</div>${rfRows}
	</div>
</div>

<footer class="index-footer">
	<span>12 principios · 4 fases · diseño de software</span>
	<span>Gustavo Adrián Salvini · <a href="https://github.com/guspatagonico" target="_blank">@guspatagonico</a></span>
</footer>

${bot}
</body>
</html>`;

	writeFileSync(INDEX_OUT, indexHTML);
	console.log(`  ✓ index.html`);
}

console.log('\nBuild complete.');
