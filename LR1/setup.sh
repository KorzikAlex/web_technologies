#!/bin/bash
set -euo pipefail

# Пути
PROJECT_ROOT="$(pwd)"

CERT_SRC="$PROJECT_ROOT/nginx/keys/tetris.crt"
KEY_SRC="$PROJECT_ROOT/nginx/keys/tetris.key"
TEMPLATE_SRC="$PROJECT_ROOT/nginx/tetris.conf.template"
NGINX_AVAILABLE_FOLDER="/etc/nginx/sites-available/"
NGINX_ENABLED_FOLDER="/etc/nginx/sites-enabled/"
NGINX_AVAILABLE="/etc/nginx/sites-available/tetris.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/tetris.conf"

# Копируем ключ и сертификат
if [[ -f "$CERT_SRC" && -f "$KEY_SRC" ]]; then
  sudo cp -f "$CERT_SRC" /etc/pki/tls/certs/tetris.crt
  sudo cp -f "$KEY_SRC" /etc/pki/tls/private/tetris.key
else
  echo "❌ Не найден cert/key по путям:"
  echo "   $CERT_SRC"
  echo "   $KEY_SRC"
  exit 1
fi

# генерируем конфиг
if [[ -f "$TEMPLATE_SRC" ]]; then
  mkdir -p $NGINX_AVAILABLE_FOLDER
  sed "s|PROJECT_ROOT|$PROJECT_ROOT|" "$TEMPLATE_SRC" | sudo tee "$NGINX_AVAILABLE" > /dev/null
else
  echo "❌ Не найден шаблон nginx: $TEMPLATE_SRC"
  exit 1
fi

# включаем сайт
sudo ln -sf "$NGINX_AVAILABLE" "$NGINX_ENABLED"

# проверка
if sudo nginx -t; then
    echo "✅ Конфиг ок"
else
    echo "❌ Ошибка в конфиге nginx!"
fi

sudo chmod -R 755 "$PROJECT_ROOT/client"
