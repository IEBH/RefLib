import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import {babel} from '@rollup/plugin-babel';
import {NodeGlobalsPolyfillPlugin} from '@esbuild-plugins/node-globals-polyfill';
import {NodeModulesPolyfillPlugin} from '@esbuild-plugins/node-modules-polyfill';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

export default defineConfig({
	plugins: [
		babel(), // Config for babel in package.json
		vue(),
	],
	resolve: {
		alias: {
			// reflib: '../..', // FIXME: Vite doesn't support relative path resolution yet, when it does uncomment + correct import in `src/components/reflibTest.vue`
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
