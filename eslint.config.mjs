import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import prettier from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default ts.config(
    {
        ignores: [
            '.next/**',
            'node_modules/**',
            'out/**',
            'dist/**',
            'build/**',
            '*.config.js',
            '*.config.ts',
            'eslint.config.mjs',
        ],
    },
    js.configs.recommended,
    ...ts.configs.recommended,
    {
        plugins: {
            '@next/next': nextPlugin,
            'react-hooks': reactHooks,
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs['core-web-vitals'].rules,
            ...reactHooks.configs.recommended.rules,
            curly: ['error', 'all'],
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
            'react/no-unescaped-entities': 'off',
            '@next/next/no-page-custom-font': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/triple-slash-reference': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            'react-hooks/exhaustive-deps': 'warn',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
        },
    },
    prettier
);
