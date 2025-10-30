#!/bin/bash

echo "出欠奉行セットアップを開始します..."

# 必要なディレクトリの作成
echo "必要なディレクトリを作成中..."
mkdir -p certs secrets front-end/dist db/mysql_datas back-end/logs

# SSL証明書の生成
if [ ! -d "certs" ] || [ ! -f "certs/server.crt" ] || [ ! -f "certs/server.key" ]; then
    echo "SSL証明書を生成中..."
    mkdir -p certs
    cd certs
    openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 365 -nodes -subj "/C=JP/ST=Tokyo/L=Tokyo/O=Demo/CN=localhost"
    openssl req -new -x509 -key server.key -out ca.crt -days 365 -subj "/C=JP/ST=Tokyo/L=Tokyo/O=Demo/CN=localhost"
    cd ..
    echo "SSL証明書を生成しました。"
else
    echo "SSL証明書は既に存在します。"
fi

# 暗号化キーの生成
if [ ! -d "secrets" ] || [ ! -f "secrets/aes.key" ]; then
    echo "暗号化キーを生成中..."
    ./generate_key.sh
    echo "暗号化キーを生成しました。"
else
    echo "暗号化キーは既に存在します。"
fi

# フロントエンドのビルド
if [ ! -d "front-end/dist" ]; then
    echo "フロントエンドをビルド中..."
    cd front-end
    npm install
    npm run build
    cd ..
    echo "フロントエンドのビルドが完了しました。"
else
    echo "フロントエンドは既にビルド済みです。"
fi

echo "セットアップが完了しました。docker-compose up --build でアプリケーションを起動してください。"