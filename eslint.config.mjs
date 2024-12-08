// @ts-check
import mizdra from '@mizdra/eslint-config-mizdra';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ['**/dist', 'examples'] },
  ...mizdra.baseConfigs,
  ...mizdra.typescriptConfigs,
  ...mizdra.nodeConfigs,
  {
    files: ['**/*.{js,jsx,mjs,cjs}', '**/*.{ts,tsx,cts,mts}'],
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          // Remove blank lines between import groups
          // ref: https://github.com/lydell/eslint-plugin-simple-import-sort?tab=readme-ov-file#how-do-i-use-this-with-dprint
          groups: [['^\\u0000', '^node:', '^@?\\w', '^', '^\\.']],
        },
      ],
    },
  },
  {
    files: ['**/*.{mjs,mts}'],
    languageOptions: {
      sourceType: 'module',
    },
  },
  mizdra.prettierConfig,
];
