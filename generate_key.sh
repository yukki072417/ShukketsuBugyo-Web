#!/bin/bash

KEY_DIR="./secrets"
KEY_FILE="$KEY_DIR/aes.key"
# IV_FILE="$KEY_DIR/aes.iv" # This is no longer needed with the improved crypto logic

mkdir -p "$KEY_DIR"

openssl rand -hex 32 > "$KEY_FILE"
# openssl rand -hex 16 > "$IV_FILE"

chmod 600 "$KEY_FILE"

echo "Keys generated in $KEY_DIR"