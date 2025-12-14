<script lang="ts" setup>
import type { PortfolioStock } from '@/interfaces/Stock';

defineProps<{
    portfolio: PortfolioStock[];
}>();

// Форматирование валюты
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
    }).format(value);
};

// Цвет для прибыли/убытка
const getProfitColor = (value: number): string => {
    if (value > 0) return 'success';
    if (value < 0) return 'error';
    return '';
};
</script>

<template>
    <v-row v-if="portfolio.length > 0" class="mt-3">
        <v-col cols="12">
            <v-card>
                <v-card-title>Мой портфель</v-card-title>
                <v-card-text>
                    <v-table>
                        <thead>
                            <tr>
                                <th>Символ</th>
                                <th>Название</th>
                                <th>Количество</th>
                                <th>Текущая цена</th>
                                <th>Общая стоимость</th>
                                <th>Прибыль/Убыток</th>
                                <th>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in portfolio" :key="item.symbol">
                                <td>{{ item.symbol }}</td>
                                <td>{{ item.name }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>
                                    {{ formatCurrency(item.currentPrice) }}
                                </td>
                                <td>
                                    {{ formatCurrency(item.totalValue) }}
                                </td>
                                <td
                                    :class="`text-${getProfitColor(item.profitLoss)}`"
                                >
                                    {{ formatCurrency(item.profitLoss) }}
                                </td>
                                <td
                                    :class="`text-${getProfitColor(item.profitLoss)}`"
                                >
                                    {{ item.profitLossPercent.toFixed(2) }}%
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>
