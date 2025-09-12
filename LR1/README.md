# Игра Тетрис

Данный проект представляет собой реализацию классической игры "Тетрис" на языке `JS` с использованием `HTML5` и `CSS3`.
Сервером является `nginx`.

Чтобы локально запустить проект, выполните следующие шаги:

1. Клонируйте репозиторий:
```shell
git clone https://github.com/KorzikAlex/web_technologies.git
```
2. Перейдите в директорию проекта:
```shell
cd LR1
```
3. Сгенерируйте самоподписанные ключи для HTTPS:
```
openssl req -new -newkey rsa:2048 -days 365 -nodes -x509 -keyout nginx/keys/server.key -out nginx/keys/server.crt
```
4. Запустите скрипт для генерации nginx файла и переноса ключей в необходимые директрии:
```shell
sh ./setup.sh
```
5. Запустите сервер nginx:
```shell
sudo nginx
```