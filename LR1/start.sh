#!/bin/bash

# копируем ключ и сертификат
sudo cp -f keys/tetris.crt /etc/pki/tls/certs/tetris.crt
sudo cp -f keys/tetris.key /etc/pki/tls/private/tetris.key

# генерируем конфиг
sed "s|PROJECT_ROOT|/home/$(whoami)/WebProjects/web_technologies/LR1|" \
    nginx/tetris.conf.template | sudo tee /etc/nginx/sites-available/tetris.conf

# включаем сайт
sudo ln -sf /etc/nginx/sites-available/tetris.conf /etc/nginx/sites-enabled/

# проверка
if sudo nginx -t; then
    echo "✅ Конфиг ок"
else
    echo "❌ Ошибка в конфиге nginx!"
fi
