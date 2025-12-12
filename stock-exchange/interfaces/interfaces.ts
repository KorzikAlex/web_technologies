interface Stock {
    symbol: string;
    companyName: string;
    currentPrice: number;
    history?: { date: string; price: number };
    enabled?: boolean;
}

interface Broker {
    id: string;
    name: string;
    balance: number;
    portfolio: Record<string, number>;
}

interface Order {
    id: string;
    brokerId: string;
    symbol: string;
    quantity: number;
    price: number;
    timestamp: string;
}

interface ExchangeSettings {
    startDate: string;
    tickSeconds: number;
    running: boolean;
}

interface RootState {
  brokers: Broker[];
  stocks: Stock[];
  market: {
    currentDate: string;
    running: boolean;
    tickSeconds: number;
  };
  prices: Record<string, number>; // symbol -> last price
  ws: {
    connected: boolean;
  };
}

