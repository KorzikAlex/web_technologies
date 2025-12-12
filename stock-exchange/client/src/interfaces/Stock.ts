export interface StockHistoryEntry {
    date: string;
    open: number;
}

export interface Stock {
    id: number;
    symbol: string;
    name: string;
    enabled: boolean;
    history: StockHistoryEntry[];
    currentPrice?: number;
}

export interface StockPriceUpdate {
    symbol: string;
    price: number;
    timestamp: string;
}

export interface PortfolioStock {
    symbol: string;
    name: string;
    quantity: number;
    purchasePrice: number;
    currentPrice: number;
    totalValue: number;
    profitLoss: number;
    profitLossPercent: number;
}
