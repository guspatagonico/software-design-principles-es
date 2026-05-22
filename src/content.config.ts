import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const TAB_CONTENT_LEAK_PATTERNS = [
	/<div class="panel(?:\s|")/,
	/<div class="context-inner"/,
	/<div class="progress"\s+id="progress"/,
	/<div class="nav-btns"/,
	/id="btnPrev"/,
	/id="btnNext"/,
];

const principle = defineCollection({
	loader: glob({ pattern: '**/*.json', base: './src/content/principle' }),
	schema: z.object({
		slug: z.string(),
		title: z.string(),
		description: z.string().optional(),
		accent: z.string(),
		position: z.number(),
		width: z.string().optional(),
		navLabel: z.string().optional(),
		cardTitle: z.string().optional(),
		cardTagline: z.string().optional(),
		cardDesc: z.string().optional(),
		indexAbbr: z.string().optional(),
		indexAbbrColor: z.string().optional(),
		rfLabel: z.string().optional(),
		headerTitle: z.string().optional(),
		headerSubtitle: z.string().optional(),
		headerLabel: z.string().optional(),
		footerLeft: z.string().optional(),
		footerRight: z.string().optional(),
		tabs: z.array(z.object({
			icon: z.string().optional(),
			label: z.string(),
			letter: z.string().optional(),
			tabColorVar: z.string().optional(),
			content: z.string(),
		})),
		origin: z.object({
			description: z.string(),
		}).optional(),
		scope: z.object({
			type: z.string().optional(),
			description: z.string().optional(),
			pills: z.array(z.string()).optional(),
		}).optional(),
	}).superRefine((value, ctx) => {
		value.tabs.forEach((tab, index) => {
			const hasLeakedMarkup = TAB_CONTENT_LEAK_PATTERNS.some(pattern => pattern.test(tab.content));
			if (!hasLeakedMarkup) return;

			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['tabs', index, 'content'],
				message: `Tab "${tab.label}" contains leaked layout markup (panel/context/progress/nav controls). Keep tabs[].content scoped to one panel only.`,
			});
		});
	}),
});

export const collections = { principle };
