import type { Page } from '@playwright/test';

/**
 * Вспомогательные функции для тестов брокера
 */

/**
 * Авторизация брокера
 */
export async function loginAsBroker(page: Page, brokerName: string = 'Гоблин') {
    await page.goto('/');
    await page.waitForURL('/login');

    // Вводим имя брокера
    await page.fill('input[type="text"]', brokerName);

    // Нажимаем кнопку входа
    await page.click('button:has-text("Войти")');

    // Ждем перехода на страницу брокера
    await page.waitForURL(/\/broker/, { timeout: 10000 });
}

/**
 * Получить текущий баланс брокера со страницы
 */
export async function getBrokerBalance(page: Page): Promise<number> {
    const balanceText = await page.locator('.broker-balance').textContent();
    if (!balanceText) {
        throw new Error('Balance not found');
    }

    // Извлекаем число из текста вида "1 000 000,00 ₽"
    const cleanText = balanceText
        .replace(/\s/g, '')
        .replace(',', '.')
        .replace('₽', '')
        .trim();

    return parseFloat(cleanText);
}

/**
 * Получить количество акций в портфеле
 */
export async function getStockQuantity(page: Page, symbol: string): Promise<number> {
    // Ищем строку в таблице портфеля с нужным символом
    const row = page.locator(`tr:has-text("${symbol}")`).first();

    const exists = await row.count();
    if (exists === 0) {
        return 0;
    }

    // Получаем количество из второй колонки
    const quantityText = await row.locator('td').nth(1).textContent();
    if (!quantityText) {
        return 0;
    }

    return parseInt(quantityText.trim(), 10);
}

/**
 * Получить среднюю цену покупки акции из портфеля
 */
export async function getAveragePurchasePrice(page: Page, symbol: string): Promise<number> {
    const row = page.locator(`tr:has-text("${symbol}")`).first();

    const exists = await row.count();
    if (exists === 0) {
        throw new Error(`Stock ${symbol} not found in portfolio`);
    }

    // Получаем среднюю цену из третьей колонки
    const priceText = await row.locator('td').nth(2).textContent();
    if (!priceText) {
        throw new Error(`Average price not found for ${symbol}`);
    }

    const cleanText = priceText
        .replace(/\s/g, '')
        .replace(',', '.')
        .replace('₽', '')
        .trim();

    return parseFloat(cleanText);
}

/**
 * Получить текущую цену акции на бирже
 */
export async function getCurrentStockPrice(page: Page, symbol: string): Promise<number> {
    // Находим строку в таблице акций
    const row = page.locator('.stocks-table').locator(`tr:has-text("${symbol}")`).first();

    // Получаем текущую цену из третьей колонки
    const priceText = await row.locator('td').nth(2).textContent();
    if (!priceText) {
        throw new Error(`Current price not found for ${symbol}`);
    }

    const cleanText = priceText
        .replace(/\s/g, '')
        .replace(',', '.')
        .replace('₽', '')
        .trim();

    return parseFloat(cleanText);
}

/**
 * Получить прибыль/убыток по акции из портфеля
 */
export async function getStockProfitLoss(page: Page, symbol: string): Promise<number> {
    const row = page.locator(`tr:has-text("${symbol}")`).first();

    const exists = await row.count();
    if (exists === 0) {
        return 0;
    }

    // Получаем прибыль/убыток из последней колонки
    const profitText = await row.locator('td').last().textContent();
    if (!profitText) {
        throw new Error(`Profit/Loss not found for ${symbol}`);
    }

    const cleanText = profitText
        .replace(/\s/g, '')
        .replace(',', '.')
        .replace('₽', '')
        .trim();

    return parseFloat(cleanText);
}

/**
 * Купить акции
 */
export async function buyStock(page: Page, symbol: string, quantity: number) {
    // Находим строку с нужной акцией в таблице акций на бирже
    const row = page.locator('.stocks-table').locator(`tr:has-text("${symbol}")`).first();

    // Нажимаем кнопку "Купить"
    await row.locator('button:has-text("Купить")').click();

    // Ждем появления диалога
    await page.waitForSelector('.v-dialog');

    // Очищаем поле и вводим количество
    await page.fill('input[type="number"]', '');
    await page.fill('input[type="number"]', quantity.toString());

    // Подтверждаем покупку
    await page.click('button:has-text("Купить")');

    // Ждем закрытия диалога
    await page.waitForTimeout(1000);
}

/**
 * Продать акции
 */
export async function sellStock(page: Page, symbol: string, quantity: number) {
    // Находим строку с нужной акцией в таблице акций на бирже
    const row = page.locator('.stocks-table').locator(`tr:has-text("${symbol}")`).first();

    // Нажимаем кнопку "Продать"
    await row.locator('button:has-text("Продать")').click();

    // Ждем появления диалога
    await page.waitForSelector('.v-dialog');

    // Очищаем поле и вводим количество
    await page.fill('input[type="number"]', '');
    await page.fill('input[type="number"]', quantity.toString());

    // Подтверждаем продажу
    await page.click('button:has-text("Продать")');

    // Ждем закрытия диалога
    await page.waitForTimeout(1000);
}

/**
 * Ожидание обновления данных через WebSocket
 */
export async function waitForPriceUpdate(page: Page, timeout: number = 5000) {
    await page.waitForTimeout(timeout);
}

/**
 * Форматирование числа в валюту для сравнения
 */
export function formatCurrency(value: number): string {
    return value.toFixed(2);
}

/**
 * Проверка, находится ли значение в допустимом диапазоне
 */
export function isWithinRange(actual: number, expected: number, tolerance: number = 0.01): boolean {
    const diff = Math.abs(actual - expected);
    return diff <= tolerance;
}
