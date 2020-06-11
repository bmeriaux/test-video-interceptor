module.exports = {
  env: {
    es6: true,
    node: true,
    mocha: true
  },
  extends: [
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018
  },
  plugins: [
    '@typescript-eslint',
    'mocha'
  ],
  rules: {
    'no-unused-vars': 'off',
    'no-unused-expressions': 'off',
    'no-inner-declarations': 'off',
    'no-useless-constructor': 'off',
  }
}
