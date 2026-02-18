import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        environment: 'jsdom',
        setupFiles: ['./test/setup.ts'],
        globals: true,
        exclude: ['**/test/e2e/**', 'node_modules/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/**',
                'test/**',
                '**/*.d.ts',
                '**/*.test.{ts,tsx}',
                'app/layout.tsx',
                'app/page.tsx',
                'app/loading.tsx',
                'app/not-found.tsx',
                'app/error.tsx',
            ],
        },
    },
});
