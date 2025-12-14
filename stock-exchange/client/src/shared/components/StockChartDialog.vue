<script lang="ts" setup>
import { ref, computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    type ChartOptions,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
);

interface StockHistoryPoint {
    timestamp: string;
    price: number;
}

interface Props {
    symbol: string;
    name: string;
    history: StockHistoryPoint[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
    close: [];
}>();

const dialog = ref(true);

const chartData = computed(() => {
    return {
        labels: props.history.map((h) =>
            new Date(h.timestamp).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }),
        ),
        datasets: [
            {
                label: 'Цена',
                data: props.history.map((h) => h.price),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
            },
        ],
    };
});

const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top',
        },
        title: {
            display: true,
            text: `График изменения цены ${props.symbol}`,
        },
    },
    scales: {
        y: {
            beginAtZero: false,
        },
    },
};

const handleClose = () => {
    dialog.value = false;
    emit('close');
};
</script>

<template>
    <v-dialog v-model="dialog" max-width="900px" @click:outside="handleClose">
        <v-card>
            <v-card-title class="text-h5">
                График {{ symbol }} - {{ name }}
            </v-card-title>
            <v-card-text>
                <div style="height: 400px">
                    <Line :data="chartData" :options="chartOptions" />
                </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="handleClose">Закрыть</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style lang="scss" scoped></style>
