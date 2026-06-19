import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'build']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Keep lint useful but not blocker-level for this project.
      'no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^[A-Z_]|^_',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // React compiler / strict hook rules are too noisy for this codebase right now.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/unsupported-syntax': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/exhaustive-deps': 'warn',

      // This repo contains a few utility exports in component files.
      'react-refresh/only-export-components': 'warn',

      // Pragmatic relaxations (common patterns in this codebase)
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-unsafe-finally': 'warn',
      'no-useless-escape': 'warn',
    },
  },
])
