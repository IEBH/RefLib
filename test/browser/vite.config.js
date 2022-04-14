import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import {babel} from '@rollup/plugin-babel';
import {NodeGlobalsPolyfillPlugin} from '@esbuild-plugins/node-globals-polyfill';
import {NodeModulesPolyfillPlugin} from '@esbuild-plugins/node-modules-polyfill';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

export default defineConfig({
	plugins: [
		babel({ // Config for babel in package.json
			babelHelpers: 'bundled', // We need to specify this here so Vite+Babel doesn't complain
		}),
		vue(),
	],
	resolve: {
		alias: {
			// KLUDGE: Absolutely horrible way to patch Reflib in using the relative path of src/components
			reflib: '../../../../lib/browser.js',
		},
	},
	optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    buffer: true,
                    process: false,
                }),
                NodeModulesPolyfillPlugin(),
            ],
        },
    },
    build: {
        rollupOptions: {
            plugins: [
                // Enable rollup polyfills plugin - used during production bundling
                rollupNodePolyFill(),
            ],
        },
    },
})
