import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    test: {
        environment: 'node',
        globals: true,
        include: ['src/__tests__/**/*.test.ts', 'src/__tests__/**/*.test.tsx'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json-summary'],
            reportsDirectory: './coverage',
            include: [
                'src/lib/**/*.ts',
            ],
            exclude: [
                'src/lib/supabase/**',
                '**/*.d.ts',
            ],
        },
    },
})

