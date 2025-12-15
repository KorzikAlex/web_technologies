@echo off
REM Скрипт для установки и запуска E2E тестов (Windows)

echo ========================================
echo Установка E2E тестов для биржи
echo ========================================
echo.

echo [1/3] Установка зависимостей npm...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ОШИБКА: Не удалось установить зависимости
    pause
    exit /b 1
)
echo.

echo [2/3] Установка браузеров Playwright...
call npx playwright install chromium
if %ERRORLEVEL% NEQ 0 (
    echo ОШИБКА: Не удалось установить браузеры
    pause
    exit /b 1
)
echo.

echo ========================================
echo Установка завершена успешно!
echo ========================================
echo.
echo Для запуска тестов:
echo   npm test           - Запуск всех тестов
echo   npm run test:ui    - Интерактивный режим
echo   npm run test:headed - С видимым браузером
echo.
echo ВАЖНО: Перед запуском тестов убедитесь, что:
echo   1. Запущен backend-сервер (cd ../server ^&^& npm run start:dev)
echo   2. Торги запущены на бирже
echo   3. Есть активные акции
echo.
pause
