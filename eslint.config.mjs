// @ts-check

import tseslint from 'typescript-eslint'
import perfectionist from 'eslint-plugin-perfectionist'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  {
    ignores: [
      '**/dist/**',
      '**/generated/**',
      '**/*.gen.ts',
      '**/public/**',
      './vendor/fork/**',

      '**/*.js',
      '**/*.mjs',
      '**/*.cjs',
    ],
  },

  ...tseslint.configs.recommendedTypeChecked,
  {
    rules: {
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
      'no-restricted-globals': [
        'error',
        {
          name: 'location',
          message: 'useLocation() を使用してください',
        },
        {
          name: 'history',
          message: 'useRouteNavigation() を使用してください',
        },
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'window',
          property: 'location',
          message: 'useLocation() を使用してください',
        },
        {
          object: 'window',
          property: 'history',
          message: 'useRouteNavigation() を使用してください',
        },
      ],
    },
  },
  {
    plugins: {
      perfectionist,
    },
    rules: {
      'perfectionist/sort-imports': 'warn',
      'perfectionist/sort-named-imports': 'warn',
    },
  },

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },

  eslintConfigPrettier,
]
