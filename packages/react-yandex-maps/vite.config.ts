import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import del from 'rollup-plugin-delete';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

export default defineConfig({
    build: {
        minify: false,
        sourcemap: false,
        outDir: 'dist',
        lib: {
            entry: 'src/index.ts',
            formats: ['es'],
        },
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                '@yandex/ymaps3-types',
                '@yandex/ymaps3-default-ui-theme',
                '@yandex/ymaps3-context-menu',
                '@yandex/ymaps3-drawer-control',
                '@yandex/ymaps3-minimap',
                '@yandex/ymaps3-resizer',
                '@yandex/ymaps3-signpost',
                '@yandex/ymaps3-spinner',
                '@yandex/ymaps3-world-utils',
                '@yandex/ymaps3-web-mercator-projection',
                '@yandex/ymaps3-cartesian-projection',
                '@yandex/ymaps3-hint',
                '@yandex/ymaps3-clusterer',
            ],
            input: {
                'react-yandex-maps': resolve(__dirname, 'src/index.ts'),
            },
            output: {
                format: 'es',
                esModule: true,
                chunkFileNames: 'react-yandex-maps-[hash].js',
                entryFileNames: '[name].js',
            },
        },
    },
    plugins: [
        del({ targets: 'dist/*' }),
        libInjectCss(),
        dts({
            tsconfigPath: resolve(__dirname, 'tsconfig.json'),
            entryRoot: resolve(__dirname, 'src'),
        }),
    ],
});

