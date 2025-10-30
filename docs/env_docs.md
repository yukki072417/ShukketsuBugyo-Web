## .envの記述内容

### ルートディレクトリ
    DB_USER=root
    MYSQL_ROOT_PASSWORD=<YOUR_SECURE_ROOT_PASSWORD>
    MYSQL_DATABASE=SHUKKETSU_BUGYO

### front-endディレクトリ

**.env.development**
    VITE_API_BASE_URL=https://192.168.1.12:3000
**.env.production**
    VITE_API_BASE_URL=https://application:3000

### back-endディレクトリ

```.env
# データベース設定
  DB_HOST=db
  DB_USER=shukketsu_kun
  DB_PASSWORD=<YOUR_SECURE_DB_PASSWORD>
  MYSQL_ROOT_PASSWORD=<YOUR_SECURE_ROOT_PASSWORD>
  MYSQL_DATABASE=SHUKKETSU_BUGYO

  # JWT設定 (それぞれ異なる、長く、推測困難な文字列を設定してください)
  JWT_TEACHERS_SECRET=<YOUR_SECURE_JWT_TEACHER_SECRET>
  REFRESH_TEACHERS_SECRET=<YOUR_SECURE_JWT_TEACHER_REFRESH_SECRET>
  JWT_STUNDENTS_SECRET=<YOUR_SECURE_JWT_STUDENT_SECRET>
  REFRESH_STUNDENTS_SECRET=<YOUR_SECURE_JWT_STUDENT_REFRESH_SECRET>
  JWT_ISSUER=shukketsu-bugyo

  # API KEY (必要に応じて設定)
  API_KEYS=<YOUR_API_KEY>
  SERVICES_API_KEY=<YOUR_SERVICE_API_KEY>

  # CORS設定
  ALLOWED_ORIGINS=https://localhost,http://localhost:5173
  # ALLOWED_ORIGINS=https://localhost:443

  # SSL証明書パス（本番環境で設定）
  # SSL_PRIVATE_KEY_PATH=/app/certs/server.key
  # SSL_CERT_PATH=/app/certs/server.crt

  # Node.js環境
  NODE_ENV=development
```