import { defineConfig } from 'astro/config';

export default defineConfig({
	output: 'static',
	site: 'https://principles.harness.ar',
	base: '/principles',
	server: {
		host: '0.0.0.0',
	},
	vite: {
		build: {
			chunkSizeWarningLimit: 2000,
		},
	},
});
