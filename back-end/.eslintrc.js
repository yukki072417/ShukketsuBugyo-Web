module.exports = {
  env: {
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    // 命名規則
    'camelcase': [
      'error',
      {
        properties: 'never',
        ignoreDestructuring: true,
        allow: [
          // データベースカラム名
          'TENANT_ID', 'STUDENT_ID', 'TEACHER_ID', 'COURSE_ID', 'CLASS_ID',
          'FIRST_NAME', 'LAST_NAME', 'FURIGANA_FIRST_NAME', 'FURIGANA_LAST_NAME',
          'SUBJECT_NAME', 'SUBJECT_NAME_EN', 'TIME_SLOT', 'START_TIME', 'END_TIME',
          'SUBJECT_DAY_OF_WEEK', 'GRADE', 'CLASS', 'NUMBER', 'STATUS', 'DATE',
          // 環境変数
          'MYSQL_ROOT_PASSWORD', 'ALLOWED_ORIGINS', 'NODE_ENV', 'JEST_WORKER_ID'
        ]
      }
    ],
    // 関数名: camelCase
    'func-names': ['error', 'as-needed'],
    // 変数名: camelCase
    'id-match': ['error', '^[a-z][a-zA-Z0-9]*$|^[A-Z][A-Z0-9_]*$', {
      properties: false,
      onlyDeclarations: true
    }]
  }
};