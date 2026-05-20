import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const principle = defineCollection({
	loader: glob({ pattern: '**/*.json', base: './src/content/principle' }),
	schema: z.object({
		slug: z.string(),
		title: z.string(),
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
	}),
});

export const collections = { principle };
