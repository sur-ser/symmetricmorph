import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: 'dist/browser',
        lib: {
            entry: 'src/SymmetricMorph.ts',
            name: 'SymmetricMorph',
            formats: ['es', 'umd'],
            fileName: (format) => `symmetricmorph.${format}.js`
        },
        rollupOptions: {
            output: {
                exports: 'default',
            }
        }
    }
});
