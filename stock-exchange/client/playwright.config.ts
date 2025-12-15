import { defineConfig, devices } from '@playwright/test';

/**
 * Конфигурация Playwright для E2E тестирования клиентской части биржи
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './e2e',
    testMatch: '**/*.spec.ts',

    // Максимальное время выполнения одного теста
    timeout: 60 * 1000,

    // Настройки для expect
    expect: {
        timeout: 10000,
    },

    // Количество повторных попыток при падении тестов
    fullyParallel: false,
    retries: process.env.CI ? 2 : 0,

    // Количество параллельных воркеров
    workers: process.env.CI ? 1 : 1,

    // Репортеры
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['list'],
    ],

    use: {
        // Базовый URL для тестов
        baseURL: 'http://localhost:5174',

        // Скриншоты только при падении
        screenshot: 'only-on-failure',

        // Видео только при падении
        video: 'retain-on-failure',

        // Трассировка только при падении
        trace: 'on-first-retry',

        // Таймаут для действий
        actionTimeout: 15000,

        // Таймаут для навигации
        navigationTimeout: 30000,
    },

    // Конфигурация браузеров для тестирования
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        // Раскомментируйте для тестирования в других браузерах
        // {
        //     name: 'firefox',
        //     use: { ...devices['Desktop Firefox'] },
        // },
        // {
        //     name: 'webkit',
        //     use: { ...devices['Desktop Safari'] },
        // },
    ],

    // Web-сервер для запуска перед тестами
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5174',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
        stdout: 'ignore',
        stderr: 'pipe',
    },
});
