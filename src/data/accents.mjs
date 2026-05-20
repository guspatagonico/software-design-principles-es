export const ACCENT_HEX = {
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

export function rgba(hex, alpha) {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return `rgba(${r},${g},${b},${alpha})`;
}

export function accentStyle(accent, alphaBg, alphaBorder) {
	const hex = ACCENT_HEX[accent] || '#d4d4d8';
	return `color:${hex};background:${rgba(hex, alphaBg || 0.12)};border-color:${rgba(hex, alphaBorder || 0.32)}`;
}
