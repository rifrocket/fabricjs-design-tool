import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { 
    ignores: [
      'dist/', 
      'lib/', 
      'node_modules/',
      '*.tsbuildinfo',
      'coverage/',
      '.nyc_output/',
      '.DS_Store',
      'Thumbs.db',
      '.vscode/',
      '.idea/',
      '*.log',
      '.cache/',
      '.parcel-cache/',
      // Temporary files and directories
      'temp/',
      'tmp/',
      '*.tmp',
      '*.temp',
      '.temp/',
      '.tmp/',
      'temp-*',
      'tmp-*',
      '*-temp',
      '*-tmp',
      '*.bak',
      '*.backup',
      '*~',
      '.#*',
      '#*#',
      '*.orig',
      '*.reject',
      '*.patch',
      '.scratch/',
      'scratch/',
      'debug/',
      '.debug/',
      'test-output/',
      'experiments/',
      'playground/',
      '.eslintcache',
      '.stylelintcache',
      '.tscache/'
    ] 
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Allow any types for now - will fix incrementally
      '@typescript-eslint/no-explicit-any': 'warn',
      // Optimization-focused rules
      'no-console': 'warn', // Warn about console statements
      '@typescript-eslint/no-unused-vars': 'error',
      'prefer-const': 'error',
      'no-case-declarations': 'error',
      'no-useless-escape': 'error',
    },
  },
)
