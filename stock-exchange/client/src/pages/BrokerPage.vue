<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import type { Broker } from '../interfaces/Broker';
import type { Stock, PortfolioStock } from '../interfaces/Stock';
import StockChartDialog from '../shared/components/StockChartDialog.vue';
import { socketService } from '../shared/services/socketService';

const router = useRouter();
const brokerId = ref<number>(Number(localStorage.getItem('brokerId')) || 1);
const broker = ref<Broker | null>(null);
const stocks = ref<Stock[]>([]);
const stockPrices = ref<Record<string, number>>({});
const currentDate = ref<string>(new Date().toLocaleDateString('ru-RU'));
const loading = ref(false);
const error = ref<string>('');
const wsConnected = ref(false);

// Диалоги
const showChartDialog = ref(false);
const selectedStock = ref<Stock | null>(null);
const stockHistory = ref<{ timestamp: string; price: number }[]>([]);

// Форма торговли
const tradeDialog = ref(false);
const tradeType = ref<'buy' | 'sell'>('buy');
const tradeStock = ref<Stock | null>(null);
const tradeQuantity = ref<number>(1);

// API базовый URL
const API_BASE = 'http://localhost:3000';

// Загрузка данных брокера
const loadBrokerData = async () => {
    try {
        loading.value = true;
        const response = await fetch(`${API_BASE}/brokers/id/${brokerId.value}`);
        const data = await response.text();
        broker.value = JSON.parse(data);
    } catch (err) {
        error.value = 'Ошибка загрузки данных брокера';
        console.error(err);
    } finally {
        loading.value = false;
    }
};

// Загрузка списка акций
const loadStocks = async () => {
    try {
        const response = await fetch(`${API_BASE}/stocks`);
        stocks.value = await response.json();
    } catch (err) {
        error.value = 'Ошибка загрузки списка акций';
        console.error(err);
    }
};

// Портфель брокера с расчетами
const portfolio = computed<PortfolioStock[]>(() => {
    if (!broker.value || !broker.value.stocks) return [];

    return Object.entries(broker.value.stocks)
        .map(([symbol, quantity]) => {
            const stock = stocks.value.find((s) => s.symbol === symbol);
            if (!stock) return null;

            const currentPrice = getStockPrice(stock);
            const purchasePrice = broker.value!.stocksPurchasePrice?.[symbol] ?? currentPrice;
            const totalValue = quantity * currentPrice;
            const profitLoss = (currentPrice - purchasePrice) * quantity;
            const profitLossPercent =
                purchasePrice > 0
                    ? ((currentPrice - purchasePrice) / purchasePrice) * 100
                    : 0;

            return {
                symbol,
                name: stock.name,
                quantity,
                purchasePrice,
                currentPrice,
                totalValue,
                profitLoss,
                profitLossPercent,
            };
        })
        .filter((item): item is PortfolioStock => item !== null);
});

// Общая стоимость портфеля
const totalPortfolioValue = computed(() => {
    return portfolio.value.reduce((sum, item) => sum + item.totalValue, 0);
});

// Общая прибыль/убыток
const totalProfitLoss = computed(() => {
    return portfolio.value.reduce((sum, item) => sum + item.profitLoss, 0);
});

// Открытие графика
const openChart = async (stock: Stock) => {
    try {
        selectedStock.value = stock;
        const response = await fetch(`${API_BASE}/stocks/${stock.symbol}/history`);
        stockHistory.value = await response.json();
        showChartDialog.value = true;
    } catch (err) {
        error.value = 'Ошибка загрузки истории акции';
        console.error(err);
    }
};

// Открытие диалога торговли
const openTradeDialog = (stock: Stock, type: 'buy' | 'sell') => {
    tradeStock.value = stock;
    tradeType.value = type;
    tradeQuantity.value = 1;
    tradeDialog.value = true;
};

// Покупка акций
const buyStock = async () => {
    if (!tradeStock.value || !broker.value) return;

    const currentPrice = getStockPrice(tradeStock.value);
    const totalCost = tradeQuantity.value * currentPrice;
    if (broker.value.balance < totalCost) {
        error.value = 'Недостаточно средств';
        return;
    }

    try {
        loading.value = true;
        const response = await fetch(
            `${API_BASE}/brokers/${brokerId.value}/buy`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol: tradeStock.value.symbol,
                    quantity: tradeQuantity.value,
                    price: currentPrice,
                }),
            },
        );

        const result = await response.json();
        if (result.broker) {
            broker.value = result.broker;
            tradeDialog.value = false;
            error.value = '';
        } else {
            error.value = result.message || 'Ошибка покупки';
        }
    } catch (err) {
        error.value = 'Ошибка при выполнении покупки';
        console.error(err);
    } finally {
        loading.value = false;
    }
};

// Продажа акций
const sellStock = async () => {
    if (!tradeStock.value || !broker.value) return;

    const ownedQuantity =
        broker.value.stocks?.[tradeStock.value.symbol] || 0;
    if (ownedQuantity < tradeQuantity.value) {
        error.value = 'Недостаточно акций для продажи';
        return;
    }

    const currentPrice = getStockPrice(tradeStock.value);

    try {
        loading.value = true;
        const response = await fetch(
            `${API_BASE}/brokers/${brokerId.value}/sell`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol: tradeStock.value.symbol,
                    quantity: tradeQuantity.value,
                    price: currentPrice,
                }),
            },
        );

        const result = await response.json();
        if (result.broker) {
            broker.value = result.broker;
            tradeDialog.value = false;
            error.value = '';
        } else {
            error.value = result.message || 'Ошибка продажи';
        }
    } catch (err) {
        error.value = 'Ошибка при выполнении продажи';
        console.error(err);
    } finally {
        loading.value = false;
    }
};

// Выполнение торговой операции
const executeTrade = () => {
    if (tradeType.value === 'buy') {
        buyStock();
    } else {
        sellStock();
    }
};

// Получить количество акций в портфеле
const getOwnedQuantity = (symbol: string): number => {
    return broker.value?.stocks?.[symbol] || 0;
};

// Форматирование валюты
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
    }).format(value);
};

// Получение текущей цены акции
const getStockPrice = (stock: Stock): number => {
    return stockPrices.value[stock.symbol] ?? stock.currentPrice ?? 0;
};

// Цвет для прибыли/убытка
const getProfitColor = (value: number): string => {
    if (value > 0) return 'success';
    if (value < 0) return 'error';
    return '';
};

// Выход из системы
const logout = () => {
    localStorage.removeItem('brokerId');
    localStorage.removeItem('brokerName');
    socketService.disconnect();
    router.push({ name: 'login' });
};

// Обработчик обновлений торговли (дата и цены)
const handleTradingUpdate = (...args: unknown[]) => {
    const data = args[0] as { settings: { currentDate: string }; prices: Record<string, number> };
    if (data.settings?.currentDate) {
        currentDate.value = new Date(data.settings.currentDate).toLocaleDateString('ru-RU');
    }
    if (data.prices) {
        stockPrices.value = { ...stockPrices.value, ...data.prices };
        // Обновляем цены в списке акций для отображения
        Object.entries(data.prices).forEach(([symbol, price]) => {
            const stock = stocks.value.find(s => s.symbol === symbol);
            if (stock) {
                stock.currentPrice = price;
            }
        });
    }
};

// Обработчик приветственного сообщения
const handleWelcome = (...args: unknown[]) => {
    const data = args[0] as { id: string; stocks?: Stock[] };
    console.log('Connected to WebSocket:', data.id);
    wsConnected.value = true;
    if (data.stocks) {
        stocks.value = data.stocks;
    }
};

onMounted(() => {
    loadBrokerData();
    loadStocks();

    // Подключение WebSocket
    socketService.connect();
    wsConnected.value = socketService.isConnected();

    // Подписка на обновления торговли
    socketService.on('tradingUpdate', handleTradingUpdate);

    // Обработка приветственного сообщения
    socketService.on('welcome', handleWelcome);

    // Периодическое обновление данных брокера
    const interval = setInterval(() => {
        loadBrokerData();
    }, 10000);

    onUnmounted(() => {
        clearInterval(interval);
        socketService.off('tradingUpdate', handleTradingUpdate);
        socketService.off('welcome', handleWelcome);
        socketService.disconnect();
    });
});
</script>

<template>
    <v-app>
        <v-main>
            <v-container fluid>
                <v-row>
                    <v-col cols="12">
                        <v-card>
                            <v-card-title class="d-flex align-center justify-space-between">
                                <div class="d-flex align-center">
                                    <v-icon class="mr-2">mdi-account-tie</v-icon>
                                    <span>{{ broker?.name || 'Загрузка...' }}</span>
                                </div>
                                <v-btn
                                    color="error"
                                    variant="text"
                                    prepend-icon="mdi-logout"
                                    @click="logout"
                                >
                                    Выход
                                </v-btn>
                            </v-card-title>
                            <v-card-subtitle class="d-flex align-center">
                                <span>Дата торгов: {{ currentDate }}</span>
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
                                    {{
                                        wsConnected
                                            ? 'Подключено'
                                            : 'Отключено'
                                    }}
                                </v-chip>
                            </v-card-subtitle>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Информационная панель -->
                <v-row>
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
                                <div class="text-h5">
                                    {{
                                        formatCurrency(broker?.balance || 0)
                                    }}
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

                <!-- Сообщение об ошибке -->
                <v-row v-if="error">
                    <v-col cols="12">
                        <v-alert type="error" closable @click:close="error = ''">
                            {{ error }}
                        </v-alert>
                    </v-col>
                </v-row>

                <!-- Текущие акции на бирже -->
                <v-row>
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
                                        <tr
                                            v-for="stock in stocks"
                                            :key="stock.symbol"
                                        >
                                            <td>{{ stock.symbol }}</td>
                                            <td>{{ stock.name }}</td>
                                            <td>
                                                {{ formatCurrency(getStockPrice(stock)) }}
                                            </td>
                                            <td>
                                                {{
                                                    getOwnedQuantity(
                                                        stock.symbol,
                                                    )
                                                }}
                                            </td>
                                            <td>
                                                <v-btn
                                                    size="small"
                                                    color="primary"
                                                    class="mr-2"
                                                    @click="openChart(stock)"
                                                >
                                                    График
                                                </v-btn>
                                                <v-btn
                                                    size="small"
                                                    color="success"
                                                    class="mr-2"
                                                    @click="
                                                        openTradeDialog(
                                                            stock,
                                                            'buy',
                                                        )
                                                    "
                                                >
                                                    Купить
                                                </v-btn>
                                                <v-btn
                                                    size="small"
                                                    color="error"
                                                    :disabled="
                                                        getOwnedQuantity(
                                                            stock.symbol,
                                                        ) === 0
                                                    "
                                                    @click="
                                                        openTradeDialog(
                                                            stock,
                                                            'sell',
                                                        )
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

                <!-- Портфель -->
                <v-row v-if="portfolio.length > 0">
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
                                        <tr
                                            v-for="item in portfolio"
                                            :key="item.symbol"
                                        >
                                            <td>{{ item.symbol }}</td>
                                            <td>{{ item.name }}</td>
                                            <td>{{ item.quantity }}</td>
                                            <td>
                                                {{
                                                    formatCurrency(
                                                        item.currentPrice,
                                                    )
                                                }}
                                            </td>
                                            <td>
                                                {{
                                                    formatCurrency(
                                                        item.totalValue,
                                                    )
                                                }}
                                            </td>
                                            <td
                                                :class="
                                                    'text-' +
                                                    getProfitColor(
                                                        item.profitLoss,
                                                    )
                                                "
                                            >
                                                {{
                                                    formatCurrency(
                                                        item.profitLoss,
                                                    )
                                                }}
                                            </td>
                                            <td
                                                :class="
                                                    'text-' +
                                                    getProfitColor(
                                                        item.profitLoss,
                                                    )
                                                "
                                            >
                                                {{
                                                    item.profitLossPercent.toFixed(
                                                        2,
                                                    )
                                                }}%
                                            </td>
                                        </tr>
                                    </tbody>
                                </v-table>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>

            <!-- Диалог графика -->
            <StockChartDialog
                v-if="showChartDialog && selectedStock"
                :symbol="selectedStock.symbol"
                :name="selectedStock.name"
                :history="stockHistory"
                @close="showChartDialog = false"
            />

            <!-- Диалог торговли -->
            <v-dialog v-model="tradeDialog" max-width="500px">
                <v-card>
                    <v-card-title>
                        {{ tradeType === 'buy' ? 'Купить' : 'Продать' }}
                        {{ tradeStock?.symbol }}
                    </v-card-title>
                    <v-card-text>
                        <v-text-field
                            v-model.number="tradeQuantity"
                            label="Количество"
                            type="number"
                            min="1"
                            :max="
                                tradeType === 'sell'
                                    ? getOwnedQuantity(
                                          tradeStock?.symbol || '',
                                      )
                                    : undefined
                            "
                        ></v-text-field>
                        <div class="text-body-1 mt-2">
                            Цена за акцию:
                            {{ formatCurrency(tradeStock ? getStockPrice(tradeStock) : 0) }}
                        </div>
                        <div class="text-h6 mt-2">
                            Итого:
                            {{
                                formatCurrency(
                                    (tradeStock ? getStockPrice(tradeStock) : 0) * tradeQuantity,
                                )
                            }}
                        </div>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn @click="tradeDialog = false">Отмена</v-btn>
                        <v-btn
                            :color="tradeType === 'buy' ? 'success' : 'error'"
                            :loading="loading"
                            @click="executeTrade"
                        >
                            {{ tradeType === 'buy' ? 'Купить' : 'Продать' }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-main>
    </v-app>
</template>

<style lang="scss" scoped>
.v-card {
    margin-bottom: 1rem;
}
</style>