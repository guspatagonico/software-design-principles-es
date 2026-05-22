import fs from 'node:fs';
import path from 'node:path';

const PRINCIPLES_DIR = path.resolve('src/content/principle');
const TAB_CONTENT_LEAK_PATTERNS = [
	/<div class="panel(?:\s|")/,
	/<div class="context-inner"/,
	/<div class="progress"\s+id="progress"/,
	/<div class="nav-btns"/,
	/id="btnPrev"/,
	/id="btnNext"/,
];

const getLeaksForTab = (tabContent) => TAB_CONTENT_LEAK_PATTERNS.some((pattern) => pattern.test(tabContent || ''));

const validatePrincipleTabs = () => {
	const files = fs.readdirSync(PRINCIPLES_DIR).filter((name) => name.endsWith('.json')).sort();
	const issues = [];

	files.forEach((fileName) => {
		const filePath = path.join(PRINCIPLES_DIR, fileName);
		const raw = fs.readFileSync(filePath, 'utf8');
		const data = JSON.parse(raw);
		(data.tabs || []).forEach((tab, tabIndex) => {
			if (!getLeaksForTab(tab.content)) return;
			issues.push({
				fileName,
				slug: data.slug,
				tabIndex,
				tabLabel: tab.label,
			});
		});
	});

	if (!issues.length) {
		console.log(`OK: validated ${files.length} principle files, no leaked tab layout markup.`);
		return;
	}

	console.error('ERROR: leaked layout markup found inside tabs[].content');
	issues.forEach((issue) => {
		console.error(`- ${issue.fileName} (slug: ${issue.slug}) tab[${issue.tabIndex}] "${issue.tabLabel}"`);
	});
	process.exitCode = 1;
};

try {
	validatePrincipleTabs();
} catch (error) {
	console.error(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
	process.exitCode = 1;
}
