# 出欠奉行 README

## 前置き
本来学校に使用してもらうことを想定して開発したものの訳あって没(´・ω・)  
なので、ここまま没にしてても勿体ないのでソースコードを公開することに至りました。

## 概要
出欠奉行は、出欠管理を効率化するためのWebアプリケーションです。フロントエンドとバックエンドで構成されており、Dockerを利用して簡単に開発・運用できます。

## ディレクトリ構成

- `back-end/` - バックエンドAPIのソースコード。Node.js/Expressベース。
- `front-end/` - フロントエンドアプリケーション（生徒用）
- `for-student/` - フロントエンドアプリケーション（生徒用） <- 作りかけです
- `db/` - データベース関連ファイル。初期化SQL、マイグレーション、モデル定義など。
- `certs/` - SSL証明書や秘密鍵。HTTPS通信に利用。
- `configs/` - Nginxなどの設定ファイル。
- `docker/` - Docker関連ファイル。
- `docs/` - ドキュメント関連ファイル。

## セットアップ方法

### 1. 環境変数ファイルの作成

**ルートディレクトリ `.env`**
```
DB_USER=root
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_DATABASE=SHUKKETSU_BUGYO
```

**back-end/.env**
```
DB_HOST=db
DB_USER=shukketsu_kun
DB_PASSWORD=your_db_password
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_DATABASE=SHUKKETSU_BUGYO
JWT_TEACHERS_SECRET=your_jwt_teacher_secret
REFRESH_TEACHERS_SECRET=your_jwt_teacher_refresh_secret
JWT_STUNDENTS_SECRET=your_jwt_student_secret
REFRESH_STUNDENTS_SECRET=your_jwt_student_refresh_secret
JWT_ISSUER=shukketsu-bugyo
API_KEYS=your_api_key
SERVICES_API_KEY=your_service_api_key
ALLOWED_ORIGINS=https://localhost,http://localhost:5173
NODE_ENV=development
```

**db/.env**
```
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_DATABASE=SHUKKETSU_BUGYO
```

### 2. セットアップスクリプトの実行（オプション）
```sh
./setup.sh
```

### 3. アプリケーションの起動
```sh
docker-compose up --build
```

**注意**: `docker-compose up`実行時に、SSL証明書と暗号化キーが自動的に生成されます。手動でセットアップしたい場合は、上記の`setup.sh`を事前に実行してください。

## アクセス先
- フロントエンド: https://localhost:443
- バックエンドAPI: https://localhost:3000
- MySQL: localhost:3306