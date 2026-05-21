import TurndownService from 'turndown';
import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.resolve('src/content/principle');
const PUBLIC_DIR = path.resolve('public');
const LLMS_DIR = path.resolve('public/llms');
const WELL_KNOWN_DIR = path.resolve('public/.well-known');
const SITE = process.env.SITE_URL || 'https://principles.gustavosalvini.com.ar';
const SITE_NAME = 'Principios de Diseño de Software';

const td = new TurndownService({
	headingStyle: 'atx',
	codeBlockStyle: 'fenced',
	bulletListMarker: '-',
	strongDelimiter: '**',
	emDelimiter: '_',
});

td.addRule('codeBlocks', {
	filter: 'pre',
	replacement: (_content, node) => {
		const code = node.textContent.trim();
		if (!code) return '';
		let lang = '';
		const lower = code.toLowerCase();
		if (lower.includes('import ') || lower.includes('export ') || lower.includes('const ')) lang = 'js';
		else if (lower.includes('<?php')) lang = 'php';
		else if (lower.includes('def ') || (lower.includes('import ') && lower.includes('#'))) lang = 'python';
		else if (lower.includes('function') && lower.includes('{')) lang = 'js';
		else if (lower.includes('class ') && lower.includes('public ')) lang = 'java';
		else if (lower.includes('fn ') || lower.includes('let mut ')) lang = 'rust';
		return `\n\`\`\`${lang}\n${code}\n\`\`\`\n`;
	},
});

td.addRule('svg', {
	filter: 'svg',
	replacement: () => '\n*[Diagrama: representación visual del concepto]*\n',
});

td.addRule('pLetter', {
	filter: (node) => node.nodeName === 'DIV' && node.className === 'p-letter',
	replacement: () => '',
});

td.addRule('decorativeDots', {
	filter: (node) => {
		if (node.nodeName !== 'SPAN') return false;
		const cls = node.className || '';
		return ['dot', 'dot-bad', 'dot-good', 'dot-warn', 'dot-domain', 'dot-driven', 'dot-driving'].includes(cls);
	},
	replacement: () => '',
});

td.addRule('analogy', {
	filter: (node) => node.nodeName === 'DIV' && node.className === 'analogy',
	replacement: (content) => `\n> ${content.trim().replace(/\n/g, '\n> ')}\n`,
});

td.addRule('tip', {
	filter: (node) => node.nodeName === 'DIV' && node.className === 'tip',
	replacement: (content) => `\n> **TIP:** ${content.trim().replace(/\n/g, '\n> ')}\n`,
});

function htmlToMarkdown(html) {
	if (!html) return '';
	return td.turndown(html);
}

function stripHtml(str) {
	if (!str) return '';
	return str.replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, match => {
		const map = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
		return map[match] || match;
	});
}

function loadPrinciples() {
	const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'));
	return files
		.map(file => JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8')))
		.sort((a, b) => a.position - b.position);
}

function generatePrincipleMarkdown(page) {
	const sections = [];

	sections.push(`# ${page.title}\n`);

	if (page.headerSubtitle) {
		sections.push(`> ${page.headerSubtitle}\n`);
	}

	if (page.description) {
		sections.push(`${page.description}\n`);
	}

	for (const tab of page.tabs) {
		sections.push(`## ${tab.label}\n`);
		sections.push(htmlToMarkdown(tab.content));
		sections.push('');
	}

	if (page.origin?.description) {
		sections.push('## Origen del principio\n');
		sections.push(htmlToMarkdown(page.origin.description));
		sections.push('');
	}

	if (page.scope?.description) {
		sections.push('## Solo aplica a código?\n');
		sections.push(htmlToMarkdown(page.scope.description));
		if (page.scope.pills?.length) {
			sections.push(`\n> ${page.scope.pills.join(' · ')}\n`);
		}
		sections.push('');
	}

	return sections.join('\n');
}

function generateLlmsTxt(pages) {
	const lines = [];

	lines.push(`# ${SITE_NAME}`);
	lines.push('');
	lines.push(`> Guía de referencia en español con 12 principios de diseño de software — desde mindset hasta arquitectura. Organizados por orden de prioridad y aplicabilidad en el ciclo de vida real de un proyecto.`);
	lines.push('');
	lines.push(`> Escrita para developers por Gustavo Adrián Salvini (@guspatagonico).`);
	lines.push('');

	const phases = [
		{
			name: 'Fase 1 · Mindset',
			subtitle: 'Antes de escribir una sola línea',
			pages: pages.filter(p => p.position >= 1 && p.position <= 3),
		},
		{
			name: 'Fase 2 · Diseño de código',
			subtitle: 'Cuando diseñás clases y funciones',
			pages: pages.filter(p => p.position >= 4 && p.position <= 8),
		},
		{
			name: 'Fase 3 · Diseño de módulos',
			subtitle: 'Cuando el sistema empieza a crecer',
			pages: pages.filter(p => p.position === 9),
		},
		{
			name: 'Fase 4 · Arquitectura',
			subtitle: 'Cuando diseñás la estructura completa del sistema',
			pages: pages.filter(p => p.position >= 10 && p.position <= 12),
		},
	];

	for (const phase of phases) {
		lines.push(`## ${phase.name} — ${phase.subtitle}`);
		lines.push('');

		for (const p of phase.pages) {
			const url = `${SITE}/principios/${p.slug}/`;
			const tagline = stripHtml(p.headerSubtitle || p.cardTagline || '');
			lines.push(`- [${p.title}](${url}): ${tagline}`);
		}

		lines.push('');
	}

	lines.push('## Contenido completo');
	lines.push('');
	lines.push(`- [llms-full.txt](${SITE}/llms-full.txt): Todo el contenido de los 12 principios en un solo archivo Markdown (~50KB).`);
	lines.push('');

	lines.push('## Archivos por principio');
	lines.push('');

	for (const p of pages) {
		const desc = stripHtml(p.headerSubtitle || p.description || '');
		const truncated = desc.length > 140 ? desc.slice(0, 137) + '...' : desc;
		lines.push(`- [${p.title}](${SITE}/llms/${p.slug}.md): ${truncated}`);
	}

	lines.push('');

	lines.push('## Información adicional');
	lines.push('');
	lines.push(`- [Repositorio GitHub](https://github.com/guspatagonico/software-design-principles-es): Código fuente del sitio.`);
	lines.push(`- [Sitemap](${SITE}/sitemap-index.xml): Todas las páginas del sitio.`);
	lines.push(`- [.well-known/ai.json](${SITE}/.well-known/ai.json): Endpoint de descubrimiento para agentes de IA (IETF draft).`);
	lines.push('');

	return lines.join('\n');
}

function generateLlmsFull(pages) {
	const sections = [];

	sections.push(`# ${SITE_NAME} — Contenido completo`);
	sections.push('');
	sections.push('> Guía de referencia en español con 12 principios de diseño de software.');
	sections.push('> Cada principio incluye: concepto, ejemplos de código, reglas prácticas y trampas comunes.');
	sections.push('');
	sections.push('---');
	sections.push('');

	for (const page of pages) {
		sections.push(generatePrincipleMarkdown(page));
		sections.push('---');
		sections.push('');
	}

	return sections.join('\n');
}

function generateAiJson(pages) {
	return JSON.stringify({
		name: SITE_NAME,
		description: 'Guía de referencia en español con 12 principios de diseño de software — desde mindset hasta arquitectura. Con ejemplos de código, reglas prácticas y trampas comunes.',
		url: SITE,
		language: 'es',
		author: {
			name: 'Gustavo Adrián Salvini',
			url: 'https://github.com/guspatagonico',
		},
		content_types: ['reference', 'tutorial'],
		resources: {
			llms_txt: `${SITE}/llms.txt`,
			llms_full_txt: `${SITE}/llms-full.txt`,
			sitemap: `${SITE}/sitemap-index.xml`,
		},
		principles: pages.map(p => ({
			title: p.title,
			url: `${SITE}/principios/${p.slug}/`,
			markdown: `${SITE}/llms/${p.slug}.md`,
			accent: p.accent,
			position: p.position,
			tagline: p.headerSubtitle || p.cardTagline || '',
		})),
	}, null, '\t');
}

async function main() {
	console.log('Generando archivos para agentes de IA...');

	fs.mkdirSync(LLMS_DIR, { recursive: true });
	fs.mkdirSync(WELL_KNOWN_DIR, { recursive: true });

	const pages = loadPrinciples();
	console.log(`  Cargados ${pages.length} principios`);

	for (const page of pages) {
		const md = generatePrincipleMarkdown(page);
		fs.writeFileSync(path.join(LLMS_DIR, `${page.slug}.md`), md, 'utf8');
		console.log(`  ✓ llms/${page.slug}.md`);
	}

	const llmsTxt = generateLlmsTxt(pages);
	fs.writeFileSync(path.join(PUBLIC_DIR, 'llms.txt'), llmsTxt, 'utf8');
	console.log('  ✓ llms.txt');

	const llmsFull = generateLlmsFull(pages);
	fs.writeFileSync(path.join(PUBLIC_DIR, 'llms-full.txt'), llmsFull, 'utf8');
	console.log('  ✓ llms-full.txt');

	const aiJson = generateAiJson(pages);
	fs.writeFileSync(path.join(WELL_KNOWN_DIR, 'ai.json'), aiJson, 'utf8');
	console.log('  ✓ .well-known/ai.json');

	console.log('Archivos para agentes de IA generados.');
}

main().catch(err => {
	console.error('Error generating agent files:', err);
	process.exit(1);
});
