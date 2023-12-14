/*
 * @Description:
 * @Author: ldx
 * @Date: 2022-04-06 21:56:29
 * @LastEditors: ldx
 * @LastEditTime: 2022-04-06 22:30:07
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    browser: true,
    amd: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier' // eslint-config-prettier的标准用法，必须放在最后一个，用于关闭和eslint冲突规则
  ],
  plugins: ['simple-import-sort', 'prettier', '@typescript-eslint'],
  rules: {
    'prettier/prettier': ['error', {}, { usePrettierrc: true }],
    'react/react-in-jsx-scope': 'off',
    'jsx-a11y/accessible-emoji': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    'react/display-name': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'react/prop-types': 'off',
    'react-hooks/exhaustive-deps': 'off', // <--- THIS IS THE NEW RULE
    '@typescript-eslint/explicit-function-return-type': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    'comma-dangle': [2, 'never'], // 对象字面量项尾不能有逗号
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'no-case-declarations': 'off',
    'no-irregular-whitespace': 'off',
    'linebreak-style': [0, 'error', 'windows']
    // 'jsx-a11y/anchor-is-valid': [
    //   'error',
    //   {
    //     components: ['Link'],
    //     specialLink: ['hrefLeft', 'hrefRight'],
    //     aspects: ['invalidHref', 'preferButton']
    //   }
    // ]
  }
}
