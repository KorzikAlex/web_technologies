import { Injectable } from '@nestjs/common';
import { ExchangeSettings } from 'src/interfaces/ExchangeSettings';
import * as fs from 'fs';
import * as path from 'path';
import { StocksService } from 'src/stocks/stocks.service';

@Injectable()
export class ExchangeService {
    private readonly SETTINGS_PATH = path.join('data', 'settings.json');
    private settings: ExchangeSettings;
    private intervalId: NodeJS.Timeout | null = null;
    private currentDateIndex = 0;
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
        if (this.settings.running) {
            return { success: false, message: 'Trading is already running' };
        }

        this.settings.running = true;
        this.currentDateIndex = 0;
        this.saveSettings();

        // Start the interval for date/price updates
        this.intervalId = setInterval(() => {
            this.updateTradingTick();
        }, this.settings.tickSeconds * 1000);

        console.log('Trading started');
        return { success: true };
    }

    stopTrading(): { success: boolean; message?: string } {
        if (!this.settings.running) {
            return { success: false, message: 'Trading is not running' };
        }

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.settings.running = false;
        this.saveSettings();

        console.log('Trading stopped');
        return { success: true };
    }

    private updateTradingTick(): void {
        const stocks = this.stocksService.getStocks();
        const enabledStocks = stocks.filter((s) => s.enabled);

        if (enabledStocks.length === 0) {
            console.log('No enabled stocks for trading');
            return;
        }

        // Calculate current simulated date
        const startDate = new Date(this.settings.startDate);
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + this.currentDateIndex);

        const currentDateStr = currentDate.toISOString().split('T')[0];

        // Update current date in settings (but don't persist to file every tick)
        const updatedSettings = {
            ...this.settings,
            currentDate: currentDateStr,
        };

        // Get prices for all enabled stocks for the current date
        const prices: Record<string, number> = {};

        enabledStocks.forEach((stock) => {
            const fullStock = this.stocksService.getStock(stock.symbol);
            if (fullStock && fullStock.history) {
                // Find price for current date or use closest available
                const historyEntry = fullStock.history.find((h) => h.date === currentDateStr);
                if (historyEntry) {
                    prices[stock.symbol] = historyEntry.open;
                } else if (fullStock.history.length > 0) {
                    // If exact date not found, use the first available price
                    prices[stock.symbol] = fullStock.history[0].open;
                }
            }
        });

        // Notify subscribers (WebSocket)
        if (this.tradingUpdateCallback) {
            this.tradingUpdateCallback(updatedSettings as ExchangeSettings, prices);
        }

        this.currentDateIndex++;

        // Check if we've exhausted all history dates (optional: loop or stop)
        // For now, we'll just keep incrementing
    }

    getCurrentTradingState(): {
        settings: ExchangeSettings;
        currentDate?: string;
        prices: Record<string, number>;
    } {
        const stocks = this.stocksService.getStocks();
        const enabledStocks = stocks.filter((s) => s.enabled);

        const prices: Record<string, number> = {};

        if (this.settings.running) {
            const startDate = new Date(this.settings.startDate);
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + this.currentDateIndex);
            const currentDateStr = currentDate.toISOString().split('T')[0];

            enabledStocks.forEach((stock) => {
                const fullStock = this.stocksService.getStock(stock.symbol);
                if (fullStock && fullStock.history) {
                    const historyEntry = fullStock.history.find((h) => h.date === currentDateStr);
                    if (historyEntry) {
                        prices[stock.symbol] = historyEntry.open;
                    } else if (fullStock.history.length > 0) {
                        prices[stock.symbol] = fullStock.history[0].open;
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
