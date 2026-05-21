import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE_URL = process.env.SITE_URL || 'https://principles.gustavosalvini.com.ar';

export default defineConfig({
	output: 'static',
	site: SITE_URL,
	base: '/',
	integrations: [sitemap()],
	server: {
		host: '0.0.0.0',
	},
	vite: {
		build: {
			chunkSizeWarningLimit: 2000,
		},
	},
});
