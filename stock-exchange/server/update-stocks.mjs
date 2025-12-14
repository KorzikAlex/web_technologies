import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_DIR = path.join(__dirname, 'data', 'csv');
const STOCKS_JSON = path.join(__dirname, 'data', 'stocks.json');

// Парсинг CSV файла
function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',');

    const history = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const dateStr = values[0]; // MM/DD/YYYY
        const open = parseFloat(values[3].replace('$', ''));

        if (dateStr && !isNaN(open)) {
            // Конвертируем MM/DD/YYYY в YYYY-MM-DD
            const [month, day, year] = dateStr.split('/');
            const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

            history.push({
                date: isoDate,
                open
            });
        }
    }

    // Разворачиваем массив, чтобы старые даты были в начале
    return history.reverse();
}

// Маппинг символов акций к их названиям
const stockMapping = {
    'AAPL': { id: 1, name: 'Apple, Inc.', enabled: true },
    'SBUX': { id: 2, name: 'Starbucks, Inc.', enabled: false },
    'MSFT': { id: 3, name: 'Microsoft, Inc.', enabled: true },
    'CSCO': { id: 4, name: 'Cisco Systems, Inc.', enabled: true },
    'QCOM': { id: 5, name: 'QUALCOMM Incorporated', enabled: true },
    'AMZN': { id: 6, name: 'Amazon.com, Inc.', enabled: true },
    'TSLA': { id: 7, name: 'Tesla, Inc.', enabled: false },
    'AMD': { id: 8, name: 'Advanced Micro Devices, Inc.', enabled: false },
    'META': { id: 9, name: 'Meta Platforms, Inc.', enabled: false },
    'NFLX': { id: 10, name: 'Netflix, Inc.', enabled: false }
};

// Основная функция
function updateStocksJSON() {
    const stocks = [];

    // Читаем все CSV файлы
    const csvFiles = fs.readdirSync(CSV_DIR).filter(file => file.endsWith('.csv'));

    csvFiles.forEach(file => {
        const symbol = path.basename(file, '.csv');
        const stockInfo = stockMapping[symbol];

        if (!stockInfo) {
            console.log(`Пропускаем ${symbol} - нет маппинга`);
            return;
        }

        console.log(`Обрабатываем ${symbol}...`);
        const csvPath = path.join(CSV_DIR, file);
        const history = parseCSV(csvPath);

        stocks.push({
            id: stockInfo.id,
            symbol,
            name: stockInfo.name,
            enabled: stockInfo.enabled,
            history
        });
    });

    // Сортируем по id
    stocks.sort((a, b) => a.id - b.id);

    // Записываем в JSON
    fs.writeFileSync(STOCKS_JSON, JSON.stringify(stocks, null, 4), 'utf-8');

    console.log(`\nГотово! Обновлено ${stocks.length} акций в stocks.json`);
    stocks.forEach(stock => {
        console.log(`  ${stock.symbol}: ${stock.history.length} записей`);
    });
}

updateStocksJSON();
