module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'react-app',
    'react-app/jest'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // 命名規則
    '@typescript-eslint/naming-convention': [
      'error',
      // 変数・関数: camelCase
      {
        selector: 'variable',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE']
      },
      {
        selector: 'function',
        format: ['camelCase']
      },
      // 型・インターフェース・クラス: PascalCase
      {
        selector: 'typeLike',
        format: ['PascalCase']
      },
      // 定数: UPPER_CASE
      {
        selector: 'variable',
        modifiers: ['const'],
        format: ['camelCase', 'PascalCase', 'UPPER_CASE']
      },
      // プロパティ: camelCase (APIレスポンス用にUPPER_CASEも許可)
      {
        selector: 'property',
        format: ['camelCase', 'UPPER_CASE']
      }
    ]
  }
};