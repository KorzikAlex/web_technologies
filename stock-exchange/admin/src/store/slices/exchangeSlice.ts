import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { ExchangeSettings } from '@/interfaces/ExchangeSettings';

const API_BASE = 'http://localhost:3000/exchange';

interface ExchangeState {
    settings: ExchangeSettings;
    currentDate?: string;
    prices: Record<string, number>;
    loading: boolean;
    error: string | null;
}

const initialState: ExchangeState = {
    settings: {
        startDate: '2021-11-03',
        tickSeconds: 1,
        running: false,
    },
    currentDate: undefined,
    prices: {},
    loading: false,
    error: null,
};

// Async thunks
export const fetchExchangeSettings = createAsyncThunk('exchange/fetchSettings', async () => {
    const response = await fetch(`${API_BASE}/settings`);
    if (!response.ok) throw new Error('Failed to fetch exchange settings');
    return (await response.json()) as ExchangeSettings;
});

export const updateExchangeSettings = createAsyncThunk(
    'exchange/updateSettings',
    async (settings: Partial<ExchangeSettings>) => {
        const response = await fetch(`${API_BASE}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        if (!response.ok) throw new Error('Failed to update exchange settings');
        return (await response.json()) as ExchangeSettings;
    },
);

export const startTrading = createAsyncThunk('exchange/startTrading', async () => {
    const response = await fetch(`${API_BASE}/start`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to start trading');
    return await response.json();
});

export const stopTrading = createAsyncThunk('exchange/stopTrading', async () => {
    const response = await fetch(`${API_BASE}/stop`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to stop trading');
    return await response.json();
});

export const fetchTradingState = createAsyncThunk('exchange/fetchState', async () => {
    const response = await fetch(`${API_BASE}/state`);
    if (!response.ok) throw new Error('Failed to fetch trading state');
    return await response.json() as {
        settings: ExchangeSettings;
        currentDate?: string;
        prices: Record<string, number>;
    };
});

const exchangeSlice = createSlice({
    name: 'exchange',
    initialState,
    reducers: {
        updateTradingState: (
            state,
            action: PayloadAction<{
                settings: ExchangeSettings & { currentDate?: string };
                prices: Record<string, number>;
            }>,
        ) => {
            state.settings = {
                startDate: action.payload.settings.startDate,
                tickSeconds: action.payload.settings.tickSeconds,
                running: action.payload.settings.running,
            };
            state.prices = action.payload.prices;
            if (action.payload.settings.currentDate) {
                state.currentDate = action.payload.settings.currentDate;
            }
        },
        updatePrices: (state, action: PayloadAction<Record<string, number>>) => {
            state.prices = { ...state.prices, ...action.payload };
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch settings
            .addCase(fetchExchangeSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExchangeSettings.fulfilled, (state, action: PayloadAction<ExchangeSettings>) => {
                state.loading = false;
                state.settings = action.payload;
            })
            .addCase(fetchExchangeSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch exchange settings';
            })
            // Update settings
            .addCase(updateExchangeSettings.fulfilled, (state, action: PayloadAction<ExchangeSettings>) => {
                state.settings = action.payload;
            })
            // Start trading
            .addCase(startTrading.fulfilled, (state) => {
                state.settings.running = true;
            })
            // Stop trading
            .addCase(stopTrading.fulfilled, (state) => {
                state.settings.running = false;
            })
            // Fetch trading state
            .addCase(fetchTradingState.fulfilled, (state, action) => {
                state.settings = action.payload.settings;
                state.currentDate = action.payload.currentDate;
                state.prices = action.payload.prices;
            });
    },
});

export const { updateTradingState, updatePrices } = exchangeSlice.actions;
export default exchangeSlice.reducer;
