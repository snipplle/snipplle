// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import eslintPluginPrettier from 'eslint-plugin-prettier'

export default withNuxt({
  plugins: {
    prettier: eslintPluginPrettier,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'prettier/prettier': [
      'error',
      {
        semi: false,
        endOfLine: 'auto',
        tabWidth: 2,
        singleQuote: true,
        trailingComma: 'all',
        vueIndentScriptAndStyle: true,
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_.*',
        varsIgnorePattern: '^_.*',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
})
