<script setup lang="ts">
import type { Broker } from '@/interfaces/Broker';
import type { Stock } from '@/interfaces/Stock';
import BrokersTable from '@/shared/components/BrokersTable.vue';
import { socketService } from '@/shared/services/socketService';
import { ref, onMounted, onUnmounted, computed } from 'vue';

const API_BASE = 'http://localhost:3000';

const brokers = ref<Broker[]>([]);
const stocks = ref<Stock[]>([]);
const stockPrices = ref<Record<string, number>>({});
const loading = ref(true);
const error = ref<string | null>(null);

// Загрузка данных с сервера
const fetchData = async () => {
    loading.value = true;
    error.value = null;

    try {
        // Загружаем брокеров
        const brokersResponse = await fetch(`${API_BASE}/brokers`);
        if (!brokersResponse.ok) {
            throw new Error('Ошибка загрузки брокеров');
        }
        brokers.value = await brokersResponse.json();

        // Загружаем акции
        const stocksResponse = await fetch(`${API_BASE}/stocks`);
        if (!stocksResponse.ok) {
            throw new Error('Ошибка загрузки акций');
        }
        stocks.value = await stocksResponse.json();

        // Загружаем текущее состояние торгов
        const tradingStateResponse = await fetch(`${API_BASE}/exchange/state`);
        if (tradingStateResponse.ok) {
            const tradingState = await tradingStateResponse.json();
            if (tradingState.prices) {
                stockPrices.value = tradingState.prices;
            }
        }
    } catch (err) {
        error.value = err instanceof Error ? err.message : 'Неизвестная ошибка';
        console.error('Ошибка загрузки данных:', err);
    } finally {
        loading.value = false;
    }
};

// Обработчик обновления цен через WebSocket
const handleTradingUpdate = (...args: unknown[]) => {
    const data = args[0] as { settings: any; prices: Record<string, number> };
    if (data?.prices) {
        stockPrices.value = { ...data.prices };
    }
};

// Брокеры с текущими ценами
const brokersWithPrices = computed(() => {
    return brokers.value.map(broker => ({
        ...broker,
        currentPrices: stockPrices.value
    }));
});

onMounted(() => {
    fetchData();

    // Подключаемся к WebSocket
    socketService.connect();
    socketService.on('tradingUpdate', handleTradingUpdate);
});

onUnmounted(() => {
    socketService.off('tradingUpdate', handleTradingUpdate);
});
</script>

<template>
    <v-main class="pa-4">
        <v-alert v-if="error" type="error" class="mb-4">
            {{ error }}
        </v-alert>

        <v-progress-circular v-if="loading" indeterminate color="primary" class="d-block mx-auto" />

        <BrokersTable v-else :brokers="brokersWithPrices" :stock-prices="stockPrices" />
    </v-main>
</template>

<style lang="scss" scoped></style>