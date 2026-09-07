const { defineConfig } = require('eslint/config');
const prettierConfig = require('eslint-config-prettier');
const importPlugin = require('eslint-plugin-import');
const unusedImports = require('eslint-plugin-unused-imports');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');

module.exports = defineConfig([
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': 'error',
      'no-warning-comments': [
        'error',
        { terms: ['eslint-disable', '@ts-ignore', '@ts-nocheck'], location: 'anywhere' },
      ],
      'import/no-named-as-default': 'error',
      'import/no-named-as-default-member': 'error',
      'import/no-duplicates': 'error',
      'import/first': 'error',
      'import/order': ['error', { 'newlines-between': 'never' }],
      'import/no-cycle': 'error',
      'import/no-self-import': 'error',
      'no-empty-character-class': 'error',
      'no-empty-pattern': ['error', { allowObjectPatternsAsParameters: false }],
      'no-extend-native': ['error', { exceptions: [] }],
      'no-extra-bind': 'error',
      'no-unreachable': 'error',
      'no-unsafe-negation': ['error', { enforceForOrderingRelations: false }],
      'no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: false, allowTaggedTemplates: false },
      ],
      'no-unused-labels': 'error',
      'no-with': 'error',
      'unicode-bom': ['error', 'never'],
      complexity: ['error', 10],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      'max-depth': ['error', 3],
      'max-params': ['error', 4],
      'max-nested-callbacks': ['error', 3],
    },
  },
  {
    files: ['**/*.{ts,tsx,d.ts}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-ignore': true, 'ts-nocheck': true, 'ts-expect-error': 'allow-with-description' },
      ],
      '@typescript-eslint/array-type': ['error', { default: 'array' }],
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' },
      ],
      '@typescript-eslint/no-extra-non-null-assertion': 'error',
      '@typescript-eslint/no-redeclare': 'error',
      '@typescript-eslint/no-useless-constructor': 'error',
      '@typescript-eslint/no-require-imports': 'error',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      typescriptEslint.configs['flat/strict-type-checked'],
      typescriptEslint.configs['flat/stylistic-type-checked'],
    ],
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    extends: [typescriptEslint.configs['flat/disable-type-checked']],
  },
  prettierConfig,
  {
    rules: {
      curly: ['error', 'all'],
    },
  },
  {
    ignores: ['dist/**', 'build/**', 'coverage/**', 'node_modules/**'],
  },
]);
