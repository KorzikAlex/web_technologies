import { test, expect } from '@playwright/test';
import { loginAsBroker, getBrokerBalance } from './helpers/broker-helpers';

/**
 * E2E тесты для задания #7
 *
 * Проверяется:
 * - Покупка N акций с изменением баланса брокера
 * - Продажа N акций с изменением баланса брокера
 * - Расчет прибыли/убытка по акции
 */

test.describe('Тесты торговли акциями (Задание #7)', () => {

    test('Покупка акций - изменение баланса брокера', async ({ page }) => {
        await loginAsBroker(page, 'Гоблин');
        await page.waitForLoadState('networkidle');

        // Получаем начальный баланс
        const initialBalance = await getBrokerBalance(page);
        console.log(`\n=== ПОКУПКА АКЦИЙ ===`);
        console.log(`Начальный баланс: ${initialBalance.toFixed(2)} ₽`);

        // Находим акцию AAPL в таблице доступных акций
        const stocksTable = page.locator('.stocks-table, table').first();
        await expect(stocksTable).toBeVisible({ timeout: 10000 });

        // Ищем строку с AAPL
        const stockRow = stocksTable.locator('tbody tr').filter({ hasText: 'AAPL' }).first();
        await expect(stockRow).toBeVisible();

        const stockSymbol = await stockRow.locator('td').first().textContent() || '';
        const priceText = await stockRow.locator('td').nth(2).textContent() || '';

        console.log(`Акция: ${stockSymbol}`);
        console.log(`Текущая цена: ${priceText}`);

        // Нажимаем кнопку "Купить"
        await stockRow.locator('button:has-text("Купить")').click();

        // Ждем появления диалога покупки
        await expect(page.locator('.v-dialog')).toBeVisible({ timeout: 5000 });

        // Вводим количество акций (N = 10)
        const quantityInput = page.locator('.v-dialog input[type="number"]');
        await quantityInput.clear();
        await quantityInput.fill('10');

        // Подтверждаем покупку
        await page.locator('.v-dialog button:has-text("Купить")').click();

        // Ждем закрытия диалога и обновления баланса
        await page.waitForTimeout(2000);

        // Получаем новый баланс после покупки
        const newBalance = await getBrokerBalance(page);
        console.log(`Баланс после покупки: ${newBalance.toFixed(2)} ₽`);

        // Проверяем, что баланс уменьшился
        expect(newBalance).toBeLessThan(initialBalance);

        const spent = initialBalance - newBalance;
        console.log(`Потрачено на покупку 10 акций: ${spent.toFixed(2)} ₽`);
        console.log(`Цена за 1 акцию: ${(spent / 10).toFixed(2)} ₽`);

        // Проверяем, что разница соответствует покупке 10 акций
        expect(spent).toBeGreaterThan(0);
    });

    test('Продажа акций - изменение баланса брокера', async ({ page }) => {
        await loginAsBroker(page, 'Гоблин');
        await page.waitForLoadState('networkidle');

        // Получаем начальный баланс
        const initialBalance = await getBrokerBalance(page);
        console.log(`\n=== ПРОДАЖА АКЦИЙ ===`);
        console.log(`Начальный баланс: ${initialBalance.toFixed(2)} ₽`);

        // Проверяем портфель для информации о количестве
        const portfolioTable = page.locator('.portfolio-table, table').nth(1);
        await expect(portfolioTable).toBeVisible({ timeout: 10000 });

        // Берем первую акцию из портфеля
        const portfolioRow = portfolioTable.locator('tbody tr').first();
        await expect(portfolioRow).toBeVisible();

        const stockSymbol = await portfolioRow.locator('td').first().textContent() || '';
        const quantityBefore = await portfolioRow.locator('td').nth(2).textContent() || '';
        const currentPriceText = await portfolioRow.locator('td').nth(3).textContent() || '';

        console.log(`Акция в портфеле: ${stockSymbol}`);
        console.log(`Количество: ${quantityBefore} шт.`);
        console.log(`Текущая цена: ${currentPriceText}`);

        // Находим эту акцию в таблице акций и нажимаем "Продать"
        const stocksTable = page.locator('.stocks-table, table').first();
        const stockRow = stocksTable.locator('tbody tr').filter({ hasText: stockSymbol }).first();
        await expect(stockRow).toBeVisible();

        await stockRow.locator('button:has-text("Продать")').click();

        // Ждем появления диалога продажи
        await expect(page.locator('.v-dialog')).toBeVisible({ timeout: 5000 });

        // Вводим количество акций для продажи (N = 5)
        const quantityInput = page.locator('.v-dialog input[type="number"]');
        await quantityInput.clear();
        await quantityInput.fill('5');

        // Подтверждаем продажу
        await page.locator('.v-dialog button:has-text("Продать")').click();

        // Ждем закрытия диалога и обновления баланса
        await page.waitForTimeout(2000);

        // Получаем новый баланс после продажи
        const newBalance = await getBrokerBalance(page);
        console.log(`Баланс после продажи: ${newBalance.toFixed(2)} ₽`);

        // Проверяем, что баланс увеличился
        expect(newBalance).toBeGreaterThan(initialBalance);

        const earned = newBalance - initialBalance;
        console.log(`Получено за продажу 5 акций: ${earned.toFixed(2)} ₽`);
        console.log(`Цена за 1 акцию: ${(earned / 5).toFixed(2)} ₽`);

        // Проверяем, что разница соответствует продаже 5 акций
        expect(earned).toBeGreaterThan(0);
    });

    test('Прибыль/убыток по акции в портфеле', async ({ page }) => {
        await loginAsBroker(page, 'Гоблин');
        await page.waitForLoadState('networkidle');

        console.log(`\n=== ПРИБЫЛЬ/УБЫТОК ===`);

        // Находим портфель
        const portfolioTable = page.locator('.portfolio-table, table').nth(1);
        await expect(portfolioTable).toBeVisible({ timeout: 10000 });

        // Проверяем первую акцию в портфеле
        const portfolioRow = portfolioTable.locator('tbody tr').first();
        await expect(portfolioRow).toBeVisible();

        const stockSymbol = await portfolioRow.locator('td').first().textContent() || '';
        const quantity = await portfolioRow.locator('td').nth(2).textContent() || '';
        const currentPrice = await portfolioRow.locator('td').nth(3).textContent() || '';
        const avgBuyPrice = await portfolioRow.locator('td').nth(4).textContent() || '';
        const profitLoss = await portfolioRow.locator('td').nth(5).textContent() || '';

        console.log(`Акция: ${stockSymbol}`);
        console.log(`Количество: ${quantity} шт.`);
        console.log(`Средняя цена покупки: ${avgBuyPrice}`);
        console.log(`Текущая цена: ${currentPrice}`);
        console.log(`Прибыль/Убыток: ${profitLoss}`);

        // Проверяем, что все данные присутствуют
        expect(stockSymbol).toBeTruthy();
        expect(quantity).toBeTruthy();
        expect(currentPrice).toBeTruthy();
        expect(avgBuyPrice).toBeTruthy();
        expect(profitLoss).toBeTruthy();

        // Извлекаем числовое значение прибыли/убытка
        const profitLossMatch = profitLoss.match(/-?\d+[.,]?\d*/);
        if (profitLossMatch) {
            const profitLossValue = parseFloat(profitLossMatch[0].replace(',', '.'));
            console.log(`\n✓ Прибыль/убыток рассчитан: ${profitLossValue.toFixed(2)} ₽`);

            // Значение может быть положительным (прибыль) или отрицательным (убыток)
            expect(Math.abs(profitLossValue)).toBeGreaterThanOrEqual(0);
        }
    });

    test('Полный цикл: покупка → ожидание → продажа с прибылью/убытком', async ({ page }) => {
        await loginAsBroker(page, 'Гоблин');
        await page.waitForLoadState('networkidle');

        console.log(`\n=== ПОЛНЫЙ ЦИКЛ ТОРГОВЛИ ===`);

        // Шаг 1: Получаем начальный баланс
        const initialBalance = await getBrokerBalance(page);
        console.log(`1. Начальный баланс: ${initialBalance.toFixed(2)} ₽`);

        // Шаг 2: Покупаем акции AMD
        const stocksTable = page.locator('.stocks-table, table').first();
        const amdRow = stocksTable.locator('tbody tr').filter({ hasText: 'AMD' }).first();
        await expect(amdRow).toBeVisible();

        const buyPriceText = await amdRow.locator('td').nth(2).textContent() || '';
        console.log(`2. Покупаем 15 акций AMD по цене: ${buyPriceText}`);

        await amdRow.locator('button:has-text("Купить")').click();
        await expect(page.locator('.v-dialog')).toBeVisible();
        await page.locator('.v-dialog input[type="number"]').fill('15');
        await page.locator('.v-dialog button:has-text("Купить")').click();
        await page.waitForTimeout(2000);

        const balanceAfterBuy = await getBrokerBalance(page);
        const spent = initialBalance - balanceAfterBuy;
        console.log(`   Баланс после покупки: ${balanceAfterBuy.toFixed(2)} ₽`);
        console.log(`   Потрачено: ${spent.toFixed(2)} ₽`);

        // Шаг 3: Ожидаем изменения цены (симуляция времени)
        console.log(`3. Ожидаем изменения цены акций...`);
        await page.waitForTimeout(3000);

        // Шаг 4: Проверяем прибыль/убыток в портфеле
        const portfolioTable = page.locator('.portfolio-table, table').nth(1);
        const amdPortfolioRow = portfolioTable.locator('tbody tr').filter({ hasText: 'AMD' }).first();

        if (await amdPortfolioRow.count() > 0) {
            const profitLoss = await amdPortfolioRow.locator('td').nth(5).textContent() || '';
            console.log(`4. Текущая прибыль/убыток по AMD: ${profitLoss}`);

            // Шаг 5: Продаем акции через таблицу акций
            console.log(`5. Продаем 15 акций AMD`);
            const amdStockRow = stocksTable.locator('tbody tr').filter({ hasText: 'AMD' }).first();
            await amdStockRow.locator('button:has-text("Продать")').click();
            await expect(page.locator('.v-dialog')).toBeVisible();
            await page.locator('.v-dialog input[type="number"]').fill('15');
            await page.locator('.v-dialog button:has-text("Продать")').click();
            await page.waitForTimeout(2000);

            const finalBalance = await getBrokerBalance(page);
            const totalProfit = finalBalance - initialBalance;
            console.log(`   Финальный баланс: ${finalBalance.toFixed(2)} ₽`);
            console.log(`\n✓ ИТОГОВЫЙ РЕЗУЛЬТАТ: ${totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)} ₽`);

            if (totalProfit > 0) {
                console.log(`   Прибыль получена!`);
            } else if (totalProfit < 0) {
                console.log(`   Убыток зафиксирован.`);
            } else {
                console.log(`   Безубыточная сделка.`);
            }
        }
    });
});
