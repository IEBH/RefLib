import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import {babel} from '@rollup/plugin-babel';
import {NodeGlobalsPolyfillPlugin} from '@esbuild-plugins/node-globals-polyfill';
import {NodeModulesPolyfillPlugin} from '@esbuild-plugins/node-modules-polyfill';
import {replaceCodePlugin as replaceCode} from 'vite-plugin-replace';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

export default defineConfig({
	plugins: [
		babel(), // Config for babel in package.json
		vue(),
		replaceCode({
			replacements: [
				{ // Needed to monkey patch the stupid BFJ assesion checker out so it works in the browser with non stream.Readable instances
					from: 'check.assert.instanceStrict',
					to: 'console.log',
				},
				{ // Needed to monkey patch BFJ (again) because setImmediate is a Node thing only
					from: 'setImmediate(',
					to: 'setTimeout(',
				},
			],
		}),
	],
	resolve: {
		alias: {
			// reflib: '../..', // FIXME: Vite doesn't support relative path resolution yet, when it does uncomment + correct import in `src/components/reflibTest.vue`
			util: 'rollup-plugin-node-polyfills/polyfills/util.js', // Needed to monkey patch util.inherits into BFJ
		},
	},
	optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    process: true,
                    buffer: false,
                }),
                NodeModulesPolyfillPlugin(),
            ],
        },
    },
	/*
    build: {
        rollupOptions: {
            plugins: [
                // Enable rollup polyfills plugin - used during production bundling
                rollupNodePolyFill(),
            ],
        },
    },
	*/
})
