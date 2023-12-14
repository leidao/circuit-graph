module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-recess-order'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'mixin',
          'extend',
          'content',
          'include',
          'function',
          'return'
        ]
      }
    ],
    indentation: 2,
    'no-descending-specificity': null, // 禁止特异性较低的选择器在特异性较高的选择器之后重写
    'font-family-no-missing-generic-family-keyword': null,
    'function-name-case': null,
    'string-quotes': 'single',
    'block-no-empty': true,
    // 'selector-class-pattern': '^[a-z][a-zA-Z0-9]+$', // 选择器的命名规则  https://stylelint.io/user-guide/rules/regex
    'selector-class-pattern': null, // 选择器的命名规则  https://stylelint.io/user-guide/rules/regex
    'selector-pseudo-class-no-unknown': null,
    'declaration-colon-newline-after': null
  }
}
