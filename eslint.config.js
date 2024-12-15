import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import fs from 'fs';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

const data = fs.readFileSync(import.meta.dirname + '/.eslintrc-auto-import.json', 'utf-8');

const eslintrcAutoImportGlobals = JSON.parse(data.toString());

export default [
  {
    ignores: ['dist', 'public'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...eslintrcAutoImportGlobals.globals,
      },
    },
  },
  eslint.configs.recommended,
  {
    languageOptions: {
      parser: tsEslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        projectService: {
          allowDefaultProject: ['*.config.js', '*.js'],
        },
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
    },
  },
  ...tsEslint.configs.recommendedTypeChecked,
  ...tsEslint.configs.stylisticTypeChecked,
  {
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  {
    files: ['**/*.js'],
    ...tsEslint.configs.disableTypeChecked,
  },
  {
    ...reactPlugin.configs.flat.recommended,
    ...reactPlugin.configs.flat['jsx-runtime'],
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
    },
    plugins: {
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'simple-import-sort/imports': 'off',
      'simple-import-sort/exports': 'off',
      'no-unused-vars': 'off',
      'import/newline-after-import': 'off',
      'import/first': 'off',
      'import/no-duplicates': 'off',
      // 'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // TODO: custom hook deps
      // 'react-hooks/exhaustive-deps': [
      //   'warn',
      //   {
      //     additionalHooks: '(useMyCustomHook|useMyOtherCustomHook)',
      //   },
      // ],
    },
  },
  eslintPluginPrettier,
];
