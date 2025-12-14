<script lang="ts" setup>
import type { Stock } from '@/interfaces/Stock';

defineProps<{
    stocks: Stock[];
    getStockPrice: (stock: Stock) => number;
    getOwnedQuantity: (symbol: string) => number;
}>();

const emit = defineEmits<{
    openChart: [stock: Stock];
    openTradeDialog: [stock: Stock, type: 'buy' | 'sell'];
}>();

// Форматирование валюты
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
    }).format(value);
};
</script>

<template>
    <v-row class="mt-3">
        <v-col cols="12">
            <v-card>
                <v-card-title>Акции на бирже</v-card-title>
                <v-card-text>
                    <v-table>
                        <thead>
                            <tr>
                                <th>Символ</th>
                                <th>Название</th>
                                <th>Текущая цена</th>
                                <th>У вас</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="stock in stocks" :key="stock.symbol">
                                <td>{{ stock.symbol }}</td>
                                <td>{{ stock.name }}</td>
                                <td>
                                    {{ formatCurrency(getStockPrice(stock)) }}
                                </td>
                                <td>
                                    {{ getOwnedQuantity(stock.symbol) }}
                                </td>
                                <td>
                                    <v-btn
                                        size="small"
                                        color="primary"
                                        class="mr-2"
                                        @click="emit('openChart', stock)"
                                    >
                                        График
                                    </v-btn>
                                    <v-btn
                                        size="small"
                                        color="success"
                                        class="mr-2"
                                        @click="
                                            emit('openTradeDialog', stock, 'buy')
                                        "
                                    >
                                        Купить
                                    </v-btn>
                                    <v-btn
                                        size="small"
                                        color="error"
                                        :disabled="
                                            getOwnedQuantity(stock.symbol) === 0
                                        "
                                        @click="
                                            emit('openTradeDialog', stock, 'sell')
                                        "
                                    >
                                        Продать
                                    </v-btn>
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>
