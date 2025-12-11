import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    root: './src',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
    },
    server: {
        open: true,
        port: 5173,
    },
    resolve: {
        alias: {
            '@': path.join(__dirname, 'src'),
        },
    },
});
