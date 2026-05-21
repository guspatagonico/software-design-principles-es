import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

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

function makeSvg(name, subtitle, lineHex) {
	const W = 1200, H = 630;
	const boxX = 48, boxY = 36, boxSize = 44, boxRadius = 8;
	const siteNameX = 108, siteNameY = 64, siteNameSize = 24;
	const heroY = 290, heroSize = 72;
	const subY = 350, subSize = 31;
	const refY = 418, refSize = 21;
	const lineY = 514;
	const gitY = 562, gitSize = 20;

	const lH = lineHex || '#d4d4d8';

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
	<defs>
		<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0%" stop-color="#0a0a0a"/>
			<stop offset="100%" stop-color="#161616"/>
		</linearGradient>
	</defs>
	<rect width="${W}" height="${H}" fill="url(#bg)"/>
	<rect x="0" y="0" width="5" height="${H}" fill="${lH}" opacity="0.15"/>
	<rect x="${boxX}" y="${boxY}" width="${boxSize}" height="${boxSize}" rx="${boxRadius}" fill="${lH}" opacity="0.12"/>
	<text x="${boxX + boxSize / 2}" y="${boxY + boxSize / 2 + 9}" text-anchor="middle" fill="${lH}" font-family="system-ui,-apple-system,sans-serif" font-size="25" font-weight="700">PDS</text>
	<text x="${siteNameX}" y="${siteNameY}" fill="#fafafa" font-family="system-ui,-apple-system,sans-serif" font-size="${siteNameSize}" font-weight="600">Principios de Diseño de Software</text>
	<text x="600" y="${heroY}" text-anchor="middle" fill="${lH}" font-family="system-ui,-apple-system,sans-serif" font-size="${heroSize}" font-weight="700">${name}</text>
	<text x="600" y="${subY}" text-anchor="middle" fill="#a1a1aa" font-family="system-ui,-apple-system,sans-serif" font-size="${subSize}">${subtitle}</text>
	<text x="600" y="${refY}" text-anchor="middle" fill="#71717a" font-family="system-ui,-apple-system,sans-serif" font-size="${refSize}">Una guía de referencia para developers</text>
	<line x1="350" y1="${lineY}" x2="850" y2="${lineY}" stroke="${lH}" stroke-width="1.5" opacity="0.2"/>
	<text x="600" y="${gitY}" text-anchor="middle" fill="#52525b" font-family="system-ui,-apple-system,sans-serif" font-size="${gitSize}">https://github.com/guspatagonico</text>
</svg>`;
}

async function main() {
	const contentDir = path.resolve('src/content/principle');
	const outDir = path.resolve('public/og');

	if (!fs.existsSync(outDir)) {
		fs.mkdirSync(outDir, { recursive: true });
	}

	const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.json'));
	console.log(`Generando ${files.length + 1} imágenes OG...`);

	for (const file of files) {
		const data = JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf8'));
		const slug = data.slug;
		const hex = ACCENT_HEX[slug] || '#d4d4d8';
		const name = data.navLabel || slug.toUpperCase();
		const subtitle = data.cardTitle || data.title;
		const svg = makeSvg(name, subtitle, hex);
		const outPath = path.join(outDir, `${slug}.jpg`);
		await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile(outPath);
		console.log(`  ✓ ${slug}.jpg`);
	}

	const idxSvg = makeSvg('Principios de Diseño de Software', '12 principios · 4 fases de aplicación', ACCENT_HEX.index);
	const idxPath = path.join(outDir, 'index.jpg');
	await sharp(Buffer.from(idxSvg)).jpeg({ quality: 90 }).toFile(idxPath);
	console.log('  ✓ index.jpg');
	console.log('OG images generadas en public/og/');
}

main().catch(err => {
	console.error('Error generating OG images:', err);
	process.exit(1);
});
