<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import type { Broker } from '@/interfaces/Broker';
import type { Stock, PortfolioStock } from '@/interfaces/Stock';
import StockChartDialog from '@/shared/components/StockChartDialog.vue';
import BrokerHeader from '@/shared/components/BrokerHeader.vue';
import StocksTable from '@/shared/components/tables/StocksTable.vue';
import PortfolioTable from '@/shared/components/tables/PortfolioTable.vue';
import { socketService } from '@/shared/services/socketService';

const router = useRouter();
const brokerId = ref<number>(Number(localStorage.getItem('brokerId')) || 1);
const broker = ref<Broker | null>(null);
const stocks = ref<Stock[]>([]);
const stockPrices = ref<Record<string, number>>({});
const currentDate = ref<string>(new Date().toLocaleDateString('ru-RU'));

// История цен для графиков (с момента начала торгов)
const priceHistory = ref<Record<string, { date: string; price: number }[]>>({});
// Предыдущая стоимость портфеля для отслеживания изменений
const previousPortfolioValue = ref<number>(0);
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

// Фильтруем только активные акции (участвующие в торгах)
const activeStocks = computed(() => {
    return stocks.value.filter((stock) => stock.enabled);
});

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

// Направление изменения стоимости портфеля
const portfolioValueTrend = computed(() => {
    const current = totalPortfolioValue.value;
    const previous = previousPortfolioValue.value;
    
    if (previous === 0) return 'neutral';
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'neutral';
});

// Открытие графика
const openChart = async (stock: Stock) => {
    selectedStock.value = stock;

    try {
        // Загружаем историю от даты начала торгов до текущего момента
        const response = await fetch(`${API_BASE}/exchange/state`);
        const tradingState = await response.json();

        if (tradingState.settings?.startDate) {
            // Запрашиваем всю историю от начала торгов (без endDate, чтобы получить все данные)
            const historyResponse = await fetch(
                `${API_BASE}/stocks/${stock.symbol}/history?startDate=${tradingState.settings.startDate}`
            );
            const history = await historyResponse.json();

            stockHistory.value = history.map((h: { date: string; open: number }) => ({
                timestamp: h.date,
                price: h.open,
            }));
        } else {
            // Если торги не запущены, используем накопленную историю
            const history = priceHistory.value[stock.symbol] || [];
            stockHistory.value = history.map(h => ({
                timestamp: h.date,
                price: h.price,
            }));
        }

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
    // Если есть цена из WebSocket - используем её
    const wsPrice = stockPrices.value[stock.symbol];
    if (wsPrice !== undefined) {
        return wsPrice;
    }
    // Если есть currentPrice в самой акции - используем его
    if (stock.currentPrice !== undefined) {
        return stock.currentPrice;
    }
    // Иначе используем цену покупки из портфеля (чтобы не было убытков при остановке)
    const purchasePrice = broker.value?.stocksPurchasePrice?.[stock.symbol];
    if (purchasePrice !== undefined) {
        return purchasePrice;
    }
    return 0;
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
        const formattedDate = new Date(data.settings.currentDate).toLocaleDateString('ru-RU');
        currentDate.value = formattedDate;

        // Добавляем новые данные в историю цен для графиков
        if (data.prices) {
            Object.entries(data.prices).forEach(([symbol, price]) => {
                if (!priceHistory.value[symbol]) {
                    priceHistory.value[symbol] = [];
                }

                // Проверяем, есть ли уже запись с этой датой
                const existingEntry = priceHistory.value[symbol].find(
                    entry => entry.date === data.settings.currentDate
                );

                if (!existingEntry) {
                    // Добавляем новую точку только если её ещё нет
                    priceHistory.value[symbol].push({
                        date: data.settings.currentDate,
                        price: price,
                    });
                } else {
                    // Обновляем цену существующей записи
                    existingEntry.price = price;
                }
            });
        }
    }
    if (data.prices) {
        // Сохраняем предыдущую стоимость перед обновлением
        previousPortfolioValue.value = totalPortfolioValue.value;
        
        stockPrices.value = { ...stockPrices.value, ...data.prices };
        // Обновляем текущие цены в списке акций
        Object.entries(data.prices).forEach(([symbol, price]) => {
            const stock = stocks.value.find(s => s.symbol === symbol);
            if (stock) {
                stock.currentPrice = price;
            }
        });
    }
};

// Обработчик приветственного сообщения
const handleWelcome = async (...args: unknown[]) => {
    const data = args[0] as { id: string; stocks?: Stock[] };
    console.log('Connected to WebSocket:', data.id);
    wsConnected.value = true;
    if (data.stocks) {
        stocks.value = data.stocks;
    }

    // Загружаем начальную историю от даты начала торгов
    try {
        const response = await fetch(`${API_BASE}/exchange/state`);
        const tradingState = await response.json();

        console.log('Trading state:', tradingState);

        if (tradingState.settings?.startDate && tradingState.running) {
            // Очищаем текущую историю
            priceHistory.value = {};

            console.log(`Загрузка всей истории с ${tradingState.settings.startDate}`);

            // Загружаем историю для каждой включенной акции
            const enabledStocks = stocks.value.filter(s => s.enabled);
            for (const stock of enabledStocks) {
                const historyResponse = await fetch(
                    `${API_BASE}/stocks/${stock.symbol}/history?startDate=${tradingState.settings.startDate}`
                );
                const history = await historyResponse.json();

                console.log(`История для ${stock.symbol}: ${history.length} точек данных`);

                // Заполняем priceHistory данными
                priceHistory.value[stock.symbol] = history.map((h: { date: string; open: number }) => ({
                    date: h.date,
                    price: h.open,
                }));
            }

            console.log('Начальная история загружена:', Object.keys(priceHistory.value).length, 'акций');
        } else {
            // Если торги не запущены, просто очищаем историю
            console.log('Торги не запущены, история очищена');
            priceHistory.value = {};
        }
    } catch (err) {
        console.error('Ошибка загрузки начальной истории:', err);
        priceHistory.value = {};
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
                <!-- Заголовок с информацией о брокере -->
                <BrokerHeader 
                    :broker="broker" 
                    :current-date="currentDate" 
                    :ws-connected="wsConnected"
                    :total-balance="broker?.balance || 0" 
                    :total-portfolio-value="totalPortfolioValue"
                    :total-profit-loss="totalProfitLoss" 
                    :portfolio-value-trend="portfolioValueTrend"
                    @logout="logout" 
                />

                <!-- Сообщение об ошибке -->
                <v-row v-if="error" class="mt-3">
                    <v-col cols="12">
                        <v-alert type="error" closable @click:close="error = ''">
                            {{ error }}
                        </v-alert>
                    </v-col>
                </v-row>

                <!-- Таблица акций на бирже -->
                <StocksTable :stocks="activeStocks" :get-stock-price="getStockPrice"
                    :get-owned-quantity="getOwnedQuantity" @open-chart="openChart"
                    @open-trade-dialog="openTradeDialog" />

                <!-- Портфель -->
                <PortfolioTable :portfolio="portfolio" />
            </v-container>

            <!-- Диалог графика -->
            <StockChartDialog v-if="showChartDialog && selectedStock" :symbol="selectedStock.symbol"
                :name="selectedStock.name" :history="stockHistory" @close="showChartDialog = false" />

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
                            :max="tradeType === 'sell'
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
                            :disabled="!tradeQuantity || tradeQuantity < 1"
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
