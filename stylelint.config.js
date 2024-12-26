export default {
  extends: ['stylelint-config-recommended-scss', 'stylelint-config-standard-scss', 'stylelint-config-recess-order'],
  plugins: ['stylelint-prettier'],
  // TODO: 以下配置已包含在stylelint-config-recommended-scss中
  // plugins: ['stylelint-scss'],
  // customSyntax: 'postcss-scss',
  ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts'],
  rules: {
    'prettier/prettier': true,
    'max-nesting-depth': [5],
  },
};
