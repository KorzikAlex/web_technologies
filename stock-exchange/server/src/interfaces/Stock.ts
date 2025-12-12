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
}
