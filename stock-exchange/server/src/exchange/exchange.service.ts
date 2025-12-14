import { Injectable } from '@nestjs/common';
import { ExchangeSettings } from 'src/interfaces/ExchangeSettings';
import * as fs from 'fs';
import * as path from 'path';
import { StocksService } from 'src/stocks/stocks.service';

@Injectable()
export class ExchangeService {
    private readonly SETTINGS_PATH = path.join('data', 'settings.json');
    private settings: ExchangeSettings;
    private timeoutId: NodeJS.Timeout | null = null;
    private currentDateIndex = 0;
    private isRunning = false;
    private tradingUpdateCallback?: (
        settings: ExchangeSettings,
        prices: Record<string, number>,
    ) => void;

    constructor(private readonly stocksService: StocksService) {
        this.loadSettings();
    }

    private loadSettings(): void {
        try {
            const data = fs.readFileSync(this.SETTINGS_PATH, 'utf-8').trim();
            this.settings = JSON.parse(data) as ExchangeSettings;
        } catch (error) {
            console.error('Error loading settings:', error);
            this.settings = {
                startDate: '2021-11-03',
                tickSeconds: 1,
                running: false,
            };
        }
    }

    getSettings(): ExchangeSettings {
        return this.settings;
    }

    updateSettings(settings: Partial<ExchangeSettings>): ExchangeSettings {
        this.settings = { ...this.settings, ...settings };
        this.saveSettings();
        return this.settings;
    }

    private saveSettings(): void {
        fs.writeFileSync(this.SETTINGS_PATH, JSON.stringify(this.settings, null, 4), 'utf-8');
    }

    setTradingUpdateCallback(
        callback: (settings: ExchangeSettings, prices: Record<string, number>) => void,
    ): void {
        this.tradingUpdateCallback = callback;
    }

    startTrading(): { success: boolean; message?: string } {
        if (this.settings.running || this.isRunning) {
            return { success: false, message: 'Trading is already running' };
        }

        // Находим начальный индекс в истории по startDate
        this.currentDateIndex = this.findStartDateIndex();

        if (this.currentDateIndex === -1) {
            return { success: false, message: 'Start date not found in history' };
        }

        this.settings.running = true;
        this.isRunning = true;
        this.saveSettings();

        // Start the first tick
        this.scheduleTick();

        console.log(`Trading started from ${this.settings.startDate} (index: ${this.currentDateIndex})`);
        return { success: true };
    }

    private findStartDateIndex(): number {
        // Получаем первую акцию для поиска индекса даты
        const stocks = this.stocksService.getStocks();
        const firstStock = stocks.find(s => s.enabled);

        if (!firstStock) {
            return -1;
        }

        const fullStock = this.stocksService.getStock(firstStock.symbol);
        if (!fullStock || !fullStock.history || fullStock.history.length === 0) {
            return -1;
        }

        // Ищем индекс даты начала торгов
        const startDateIndex = fullStock.history.findIndex(
            entry => entry.date === this.settings.startDate
        );

        // Если точная дата не найдена, ищем ближайшую более позднюю
        if (startDateIndex === -1) {
            for (let i = 0; i < fullStock.history.length; i++) {
                if (fullStock.history[i].date >= this.settings.startDate) {
                    return i;
                }
            }
            return -1;
        }

        return startDateIndex;
    }

    stopTrading(): { success: boolean; message?: string } {
        if (!this.settings.running && !this.isRunning) {
            return { success: false, message: 'Trading is not running' };
        }

        this.isRunning = false;

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }

        this.settings.running = false;
        this.saveSettings();

        console.log('Trading stopped');
        return { success: true };
    }

    private scheduleTick(): void {
        if (!this.isRunning) {
            return;
        }

        this.updateTradingTick();

        // Планируем следующий тик
        this.timeoutId = setTimeout(() => {
            this.scheduleTick();
        }, this.settings.tickSeconds * 1000);
    }

    private updateTradingTick(): void {
        const stocks = this.stocksService.getStocks();
        const enabledStocks = stocks.filter((s) => s.enabled);

        if (enabledStocks.length === 0) {
            console.log('No enabled stocks for trading');
            return;
        }

        // Get prices for all enabled stocks using current index
        const prices: Record<string, number> = {};
        let currentDateStr = '';

        enabledStocks.forEach((stock) => {
            const fullStock = this.stocksService.getStock(stock.symbol);
            if (fullStock && fullStock.history && fullStock.history.length > 0) {
                // Берем цену по индексу из отсортированной истории
                const index = Math.min(this.currentDateIndex, fullStock.history.length - 1);
                const historyEntry = fullStock.history[index];
                prices[stock.symbol] = historyEntry.open;

                // Используем дату из первой акции
                if (!currentDateStr) {
                    currentDateStr = historyEntry.date;
                }
            }
        });

        // Update current date in settings (but don't persist to file every tick)
        const updatedSettings = {
            ...this.settings,
            currentDate: currentDateStr,
        };

        // Notify subscribers (WebSocket)
        if (this.tradingUpdateCallback) {
            this.tradingUpdateCallback(updatedSettings as ExchangeSettings, prices);
        }

        this.currentDateIndex++;

        // Если достигли конца истории, можно остановиться или зациклить
        if (this.currentDateIndex >= 2514) {
            console.log('Reached end of trading history');
            this.stopTrading();
        }
    }

    getCurrentTradingState(): {
        settings: ExchangeSettings;
        currentDate?: string;
        prices: Record<string, number>;
    } {
        const stocks = this.stocksService.getStocks();
        const enabledStocks = stocks.filter((s) => s.enabled);

        const prices: Record<string, number> = {};
        let currentDateStr = '';

        if (this.settings.running) {
            enabledStocks.forEach((stock) => {
                const fullStock = this.stocksService.getStock(stock.symbol);
                if (fullStock && fullStock.history && fullStock.history.length > 0) {
                    const index = Math.min(this.currentDateIndex, fullStock.history.length - 1);
                    const historyEntry = fullStock.history[index];
                    prices[stock.symbol] = historyEntry.open;

                    if (!currentDateStr) {
                        currentDateStr = historyEntry.date;
                    }
                }
            });

            return {
                settings: this.settings,
                currentDate: currentDateStr,
                prices,
            };
        }

        return {
            settings: this.settings,
            prices,
        };
    }
}
