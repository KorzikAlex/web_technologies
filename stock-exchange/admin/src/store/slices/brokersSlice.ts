import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Broker } from '@/interfaces/Broker';

const API_BASE = 'http://localhost:3000/brokers';

interface BrokersState {
    brokers: Broker[];
    loading: boolean;
    error: string | null;
}

const initialState: BrokersState = {
    brokers: [],
    loading: false,
    error: null,
};

// Async thunks
export const fetchBrokers = createAsyncThunk('brokers/fetchBrokers', async () => {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error('Failed to fetch brokers');
    return (await response.json()) as Broker[];
});

export const createBroker = createAsyncThunk(
    'brokers/createBroker',
    async ({ name, balance }: { name: string; balance: number }) => {
        const response = await fetch(`${API_BASE}/broker`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, balance }),
        });
        if (!response.ok) throw new Error('Failed to create broker');
        const data = await response.json();
        return data.broker as Broker;
    },
);

export const updateBroker = createAsyncThunk('brokers/updateBroker', async (broker: Broker) => {
    if (!broker.id) throw new Error('Broker ID is required');
    const response = await fetch(`${API_BASE}/id/${broker.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: broker.name, balance: broker.balance }),
    });
    if (!response.ok) throw new Error('Failed to update broker');
    return broker;
});

export const deleteBroker = createAsyncThunk('brokers/deleteBroker', async (brokerId: number) => {
    const response = await fetch(`${API_BASE}/id/${brokerId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete broker');
    return brokerId;
});

const brokersSlice = createSlice({
    name: 'brokers',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch brokers
            .addCase(fetchBrokers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBrokers.fulfilled, (state, action: PayloadAction<Broker[]>) => {
                state.loading = false;
                state.brokers = action.payload;
            })
            .addCase(fetchBrokers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch brokers';
            })
            // Create broker
            .addCase(createBroker.fulfilled, (state, action: PayloadAction<Broker>) => {
                state.brokers.push(action.payload);
            })
            .addCase(createBroker.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to create broker';
            })
            // Update broker
            .addCase(updateBroker.fulfilled, (state, action: PayloadAction<Broker>) => {
                const index = state.brokers.findIndex((b) => b.id === action.payload.id);
                if (index !== -1) {
                    state.brokers[index] = action.payload;
                }
            })
            .addCase(updateBroker.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to update broker';
            })
            // Delete broker
            .addCase(deleteBroker.fulfilled, (state, action: PayloadAction<number>) => {
                state.brokers = state.brokers.filter((b) => b.id !== action.payload);
            })
            .addCase(deleteBroker.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to delete broker';
            });
    },
});

export default brokersSlice.reducer;
