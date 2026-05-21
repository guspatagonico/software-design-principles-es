import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
	output: 'static',
	site: 'https://principles.harness.ar',
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
