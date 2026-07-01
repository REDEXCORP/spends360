import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import nextConfig from 'eslint-config-next';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import pluginQuery from '@tanstack/eslint-plugin-query';

const eslintConfig = [
    ...nextConfig,
    eslintConfigPrettier,
    {
        ignores: [
            'node_modules/**',
            '.next/**',
            'out/**',
            'build/**',
            'dist/**',
            'nginx/**',
            'next-env.d.ts',
            '.git/**',
            'deletable/**',
        ],
    },
    {
        plugins: {
            prettier: eslintPluginPrettier,
            '@typescript-eslint': typescriptEslint,
            '@tanstack/query': pluginQuery,
        },
        languageOptions: {
            parser: typescriptParser,
        },
        rules: {
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-inferrable-types': 'off',
            'no-console': 'off',
            'prefer-const': 'error',
            'no-var': 'error',
            'object-shorthand': 'error',
            'prefer-template': 'error',
            'prettier/prettier': 'error',
            'react-hooks/exhaustive-deps': 'off',
            '@tanstack/query/exhaustive-deps': 'error',
        },
    },
];

export default eslintConfig;
