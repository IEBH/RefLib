import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import {babel} from '@rollup/plugin-babel';
import {nodePolyfills} from 'vite-plugin-node-polyfills'

export default defineConfig({
	plugins: [
		babel({ // Config for babel in package.json
			babelHelpers: 'bundled', // We need to specify this here so Vite+Babel doesn't complain
		}),
		vue(),
		nodePolyfills({
			include: [
				'stream',
				'string_decoder',
			],
			exclude: [
				'buffer',
			],
			globals: {
				Buffer: true,
				process: false,
			},
		}),
	],
	optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
        },
    },
})
