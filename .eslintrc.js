
module.exports = {
  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },

  extends: [
    'eslint:recommended',
    'plugin:react/recommended',

    // Use canned import rules
    'plugin:import/warnings',
    // With typescript compatibility (hopefully)
    'plugin:import/typescript',

    // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:@typescript-eslint/recommended',

    // Uses eslint-config-prettier to disable ESLint rules from
    // @typescript-eslint/eslint-plugin that would conflict with prettier
    'prettier/@typescript-eslint',

    // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors.
    // Make sure this is always the last configuration in the extends array.
    'plugin:prettier/recommended',
  ],

  plugins: ['eslint-plugin-import',  'eslint-plugin-prettier'],


  env: {
    es6: true,
    node: true,
    jest: true,
  },

  rules: {
    'prettier/prettier': 'warn',

    // TYPESCRIPT
    // quality of life
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',

    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^(_|type|root|args|ctx|info)',
      },
    ],

    // IMPORTS
    'import/order': 'warn',
    'import/newline-after-import': 'warn',
    'import/no-useless-path-segments': 'warn',
    'import/no-extraneous-dependencies': 'error',
  },

  overrides: [
    {
      files: ['.*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
}
