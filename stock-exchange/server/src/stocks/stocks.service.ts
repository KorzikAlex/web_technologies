import { Injectable } from '@nestjs/common';
import { Stock, StockHistoryEntry } from 'src/interfaces/Stock';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StocksService {
    private readonly STOCKS_PATH = path.join('data', 'stocks.json');
    private stocks: Stock[] = [];

    constructor() {
        this.loadStocks();
    }

    private loadStocks(): void {
        try {
            const data = fs.readFileSync(this.STOCKS_PATH, 'utf-8').trim();
            this.stocks = JSON.parse(data) as Stock[];
        } catch (error) {
            console.error('Error loading stocks:', error);
            this.stocks = [];
        }
    }

    getStocks(): Stock[] {
        return this.stocks.map((stock) => ({
            id: stock.id,
            symbol: stock.symbol,
            name: stock.name,
            enabled: stock.enabled,
            history: [], // Don't send full history in list
        }));
    }

    getStock(symbol: string): Stock | undefined {
        return this.stocks.find((s) => s.symbol === symbol);
    }

    getStockHistory(
        symbol: string,
        startDate?: string,
        endDate?: string,
    ): StockHistoryEntry[] | null {
        const stock = this.stocks.find((s) => s.symbol === symbol);
        if (!stock) return null;

        let history = stock.history;

        // Filter by date range if provided
        if (startDate || endDate) {
            history = history.filter((entry) => {
                const entryDate = new Date(entry.date);
                if (startDate && entryDate < new Date(startDate)) return false;
                if (endDate && entryDate > new Date(endDate)) return false;
                return true;
            });
        }

        return history;
    }

    updateStockEnabled(symbol: string, enabled: boolean): Stock | null {
        const stock = this.stocks.find((s) => s.symbol === symbol);
        if (!stock) return null;

        stock.enabled = enabled;
        this.saveStocks();
        return stock;
    }

    private saveStocks(): void {
        fs.writeFileSync(this.STOCKS_PATH, JSON.stringify(this.stocks, null, 4), 'utf-8');
    }

    // WebSocket support methods
    private priceUpdateCallback?: (stock: Stock) => void;

    setPriceUpdateCallback(callback: (stock: Stock) => void): void {
        this.priceUpdateCallback = callback;
    }

    updateStockPrice(symbol: string, newPrice: number): Stock | null {
        const stock = this.stocks.find((s) => s.symbol === symbol);
        if (!stock) return null;

        // Add new history entry
        const newEntry: StockHistoryEntry = {
            date: new Date().toISOString().split('T')[0],
            open: newPrice,
        };
        stock.history.push(newEntry);

        // Notify subscribers
        if (this.priceUpdateCallback) {
            this.priceUpdateCallback(stock);
        }

        return stock;
    }

    simulatePriceChanges(): void {
        setInterval(() => {
            this.stocks.forEach((stock) => {
                if (!stock.enabled) return;

                // Get latest price from history
                const latestPrice = stock.history[stock.history.length - 1]?.open || 100;

                // Random change from -5% to +5%
                const change = (Math.random() - 0.5) * 0.1;
                const newPrice = latestPrice * (1 + change);

                this.updateStockPrice(stock.symbol, Number(newPrice.toFixed(2)));
            });
        }, 10000); // Every 10 seconds
    }
}
