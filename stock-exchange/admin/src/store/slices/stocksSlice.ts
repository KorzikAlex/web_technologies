import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Stock, StockHistoryEntry } from '@/interfaces/Stock';

const API_BASE = 'http://localhost:3000/stocks';

interface StocksState {
    stocks: Stock[];
    loading: boolean;
    error: string | null;
}

const initialState: StocksState = {
    stocks: [],
    loading: false,
    error: null,
};

// Async thunks
export const fetchStocks = createAsyncThunk(
    'stocks/fetchStocks',
    async () => {
        const response = await fetch(API_BASE);
        if (!response.ok) throw new Error('Failed to fetch stocks');
        return (await response.json()) as Stock[];
    }
);

export const fetchStockHistory = createAsyncThunk(
    'stocks/fetchStockHistory',
    async ({ symbol, startDate, endDate }: { symbol: string; startDate?: string; endDate?: string }) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const queryString = params.toString();
        const url = `${API_BASE}/${symbol}/history${queryString ? '?' + queryString : ''}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch stock history');
        const history = (await response.json()) as StockHistoryEntry[];
        return { symbol, history };
    }
);

export const updateStockEnabled = createAsyncThunk(
    'stocks/updateStockEnabled',
    async ({ symbol, enabled }: { symbol: string; enabled: boolean }) => {
        const response = await fetch(`${API_BASE}/${symbol}/enabled`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled }),
        });
        if (!response.ok) throw new Error('Failed to update stock status');
        const data = await response.json();
        return data.stock as Stock;
    }
);

const stocksSlice = createSlice({
    name: 'stocks',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch stocks
            .addCase(fetchStocks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStocks.fulfilled, (state, action: PayloadAction<Stock[]>) => {
                state.loading = false;
                state.stocks = action.payload;
            })
            .addCase(fetchStocks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch stocks';
            })
            // Fetch stock history
            .addCase(fetchStockHistory.fulfilled, (state, action) => {
                const { symbol, history } = action.payload;
                const stock = state.stocks.find((s) => s.symbol === symbol);
                if (stock) {
                    stock.history = history;
                }
            })
            .addCase(fetchStockHistory.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to fetch stock history';
            })
            // Update stock enabled
            .addCase(updateStockEnabled.fulfilled, (state, action: PayloadAction<Stock>) => {
                const index = state.stocks.findIndex((s) => s.symbol === action.payload.symbol);
                if (index !== -1) {
                    state.stocks[index].enabled = action.payload.enabled;
                }
            })
            .addCase(updateStockEnabled.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to update stock status';
            });
    },
});

export default stocksSlice.reducer;
