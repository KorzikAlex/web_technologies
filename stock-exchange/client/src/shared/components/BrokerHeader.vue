<script lang="ts" setup>
import type { Broker } from '@/interfaces/Broker';

defineProps<{
    broker: Broker | null;
    currentDate: string;
    wsConnected: boolean;
    totalBalance: number;
    totalPortfolioValue: number;
    totalProfitLoss: number;
}>();

const emit = defineEmits<{
    logout: [];
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
    <div class="broker-header">
        <!-- Заголовок с информацией о брокере -->
        <v-row>
            <v-col cols="12">
                <v-card>
                    <v-card-title class="d-flex align-center justify-space-between">
                        <div class="d-flex align-center broker-name">
                            <v-icon class="mr-2">mdi-account-tie</v-icon>
                            <span>{{ broker?.name || 'Загрузка...' }}</span>
                        </div>
                        <div class="d-flex gap-2">
                            <v-btn
                                color="primary"
                                variant="text"
                                prepend-icon="mdi-view-dashboard"
                                :to="{ name: 'admin', query: { from: 'broker' } }"
                            >
                                Админ панель
                            </v-btn>
                            <v-btn
                                color="error"
                                variant="text"
                                prepend-icon="mdi-logout"
                                @click="emit('logout')"
                            >
                                Выйти
                            </v-btn>
                        </div>
                    </v-card-title>
                    <v-card-subtitle class="d-flex align-center pa-2">
                        <span class="current-date">Дата торгов: {{ currentDate }}</span>
                        <v-spacer></v-spacer>
                        <v-chip
                            :color="wsConnected ? 'success' : 'error'"
                            size="small"
                        >
                            <v-icon
                                start
                                :icon="
                                    wsConnected
                                        ? 'mdi-cloud-check'
                                        : 'mdi-cloud-off-outline'
                                "
                            ></v-icon>
                            {{ wsConnected ? 'Подключено' : 'Отключено' }}
                        </v-chip>
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Информационная панель -->
        <v-row class="mt-3">
            <v-col cols="12" md="3">
                <v-card color="primary">
                    <v-card-text>
                        <div class="text-h6">Текущая дата</div>
                        <div class="text-h5">{{ currentDate }}</div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" md="3">
                <v-card color="success">
                    <v-card-text>
                        <div class="text-h6">Доступные средства</div>
                        <div class="text-h5 broker-balance">
                            {{ formatCurrency(totalBalance) }}
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" md="3">
                <v-card color="info">
                    <v-card-text>
                        <div class="text-h6">Стоимость портфеля</div>
                        <div class="text-h5">
                            {{ formatCurrency(totalPortfolioValue) }}
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" md="3">
                <v-card :color="getProfitColor(totalProfitLoss)">
                    <v-card-text>
                        <div class="text-h6">Прибыль/Убыток</div>
                        <div class="text-h5">
                            {{ formatCurrency(totalProfitLoss) }}
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>
