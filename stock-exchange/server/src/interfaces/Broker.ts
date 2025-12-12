export interface Broker {
    id?: number;
    name: string;
    balance: number;
    stocks?: Record<string, number>;
    stocksPurchasePrice?: Record<string, number>;
}
