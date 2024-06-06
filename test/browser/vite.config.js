import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import {babel} from '@rollup/plugin-babel';

export default defineConfig({
	plugins: [
		babel({ // Config for babel in package.json
			babelHelpers: 'bundled', // We need to specify this here so Vite+Babel doesn't complain
		}),
		vue(),
	],
	optimizeDeps: {
		esbuildOptions: {
			define: {
				global: 'globalThis',
			},
		},
	},
})
