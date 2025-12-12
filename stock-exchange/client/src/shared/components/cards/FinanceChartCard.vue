<script setup lang="ts">
import { computed } from 'vue';
import type { Broker } from '@/interfaces/Broker';

interface Props {
    broker: Broker;
    stockPrices: Record<string, number>;
}

const props = defineProps<Props>();

// Интерфейс для данных по акциям
interface StockData {
    symbol: string;
    quantity: number;
    purchasePrice: number;
    currentPrice: number;
    profitLoss: number;
    profitLossPercent: number;
}

// Рассчитываем данные по акциям с учетом реальных цен
const stocksData = computed<StockData[]>(() => {
    if (!props.broker.stocks) return [];

    return Object.entries(props.broker.stocks).map(([symbol, quantity]) => {
        // Цена покупки (из брокера или генерируем)
        const purchasePrice = props.broker.stocksPurchasePrice?.[symbol] ??
            ((symbol.charCodeAt(0) + symbol.charCodeAt(1)) * 10 + Math.random() * 50);

        // Текущая цена из реальных данных или цена покупки
        const currentPrice = props.stockPrices[symbol] ?? purchasePrice;

        // Рассчитываем прибыль/убыток
        const profitLoss = (currentPrice - purchasePrice) * quantity;
        const profitLossPercent = purchasePrice > 0 ? ((currentPrice - purchasePrice) / purchasePrice) * 100 : 0;

        return {
            symbol,
            quantity,
            purchasePrice: Number(purchasePrice.toFixed(2)),
            currentPrice: Number(currentPrice.toFixed(2)),
            profitLoss: Number(profitLoss.toFixed(2)),
            profitLossPercent: Number(profitLossPercent.toFixed(2))
        };
    });
});

// Общая прибыль/убыток
const totalProfitLoss = computed(() => {
    return stocksData.value.reduce((sum, stock) => sum + stock.profitLoss, 0).toFixed(2);
});

// Общая стоимость портфеля
const portfolioValue = computed(() => {
    return stocksData.value.reduce((sum, stock) => sum + (stock.currentPrice * stock.quantity), 0).toFixed(2);
});

// Цвет для отображения прибыли/убытка
const getProfitLossColor = (value: number) => {
    return value >= 0 ? 'success' : 'error';
};
</script>

<template>
    <v-card elevation="0" class="mt-2">
        <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-cash-multiple</v-icon>
            Прибыль/Убыток по акциям брокера {{ broker.name }}
        </v-card-title>

        <v-card-text>
            <!-- Общая статистика -->
            <v-row class="mb-4">
                <v-col cols="12" sm="6" md="4">
                    <v-card variant="tonal" color="primary">
                        <v-card-text>
                            <div class="text-caption">Баланс брокера</div>
                            <div class="text-h6">{{ broker.balance.toLocaleString('ru-RU') }} руб.</div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                    <v-card variant="tonal" color="info">
                        <v-card-text>
                            <div class="text-caption">Стоимость портфеля</div>
                            <div class="text-h6">{{ Number(portfolioValue).toLocaleString('ru-RU') }} руб.</div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                    <v-card variant="tonal" :color="getProfitLossColor(Number(totalProfitLoss))">
                        <v-card-text>
                            <div class="text-caption">Общая прибыль/убыток</div>
                            <div class="text-h6">
                                {{ Number(totalProfitLoss) >= 0 ? '+' : '' }}{{
                                    Number(totalProfitLoss).toLocaleString('ru-RU') }} руб.
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <!-- Таблица с детализацией по акциям -->
            <v-card variant="outlined" v-if="stocksData.length > 0">
                <v-card-title class="text-subtitle-1">
                    <v-icon class="mr-2">mdi-chart-bar</v-icon>
                    Детализация по акциям
                </v-card-title>
                <v-table>
                    <thead>
                        <tr>
                            <th>Акция</th>
                            <th class="text-center">Количество</th>
                            <th class="text-right">Цена покупки</th>
                            <th class="text-right">Текущая цена</th>
                            <th class="text-right">Прибыль/Убыток</th>
                            <th class="text-center">Изменение, %</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="stock in stocksData" :key="stock.symbol">
                            <td>
                                <v-chip size="small" color="primary" variant="tonal">
                                    {{ stock.symbol }}
                                </v-chip>
                            </td>
                            <td class="text-center">{{ stock.quantity }}</td>
                            <td class="text-right">{{ stock.purchasePrice.toLocaleString('ru-RU') }} руб.</td>
                            <td class="text-right">{{ stock.currentPrice.toLocaleString('ru-RU') }} руб.</td>
                            <td class="text-right">
                                <span :class="stock.profitLoss >= 0 ? 'text-success' : 'text-error'">
                                    {{ stock.profitLoss >= 0 ? '+' : '' }}{{ stock.profitLoss.toLocaleString('ru-RU') }}
                                    руб.
                                </span>
                            </td>
                            <td class="text-center">
                                <v-chip size="small" :color="getProfitLossColor(stock.profitLoss)" variant="tonal">
                                    {{ stock.profitLossPercent >= 0 ? '+' : '' }}{{ stock.profitLossPercent }}%
                                </v-chip>
                            </td>
                        </tr>
                    </tbody>
                </v-table>
            </v-card>

            <v-alert v-else type="info" variant="tonal" class="mt-4">
                У брокера {{ broker.name }} нет акций в портфеле
            </v-alert>

            <!-- Пояснение -->
            <v-card variant="tonal" color="grey-lighten-4" class="mt-4">
                <v-card-text>
                    <div class="text-caption">
                        <v-icon size="small" class="mr-1">mdi-information</v-icon>
                        <strong>Прибыль/Убыток</strong> рассчитывается как: (Текущая цена - Цена покупки) × Количество
                        акций
                    </div>
                </v-card-text>
            </v-card>
        </v-card-text>
    </v-card>
</template>

<style lang="scss" scoped></style>