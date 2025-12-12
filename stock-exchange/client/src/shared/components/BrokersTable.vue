<script setup lang="ts">

import { type Broker } from '@/interfaces/Broker';
import { ref } from 'vue';
import FinanceChartCard from './cards/FinanceChartCard.vue';

interface Props {
    brokers?: Broker[];
    stockPrices?: Record<string, number>;
}

const props = defineProps<Props>();

const expandedRows = ref<string[]>([]);

const toggleExpand = (brokerId: number) => {
    const id = brokerId.toString();
    const index = expandedRows.value.indexOf(id);
    if (index > -1) {
        expandedRows.value.splice(index, 1);
    } else {
        expandedRows.value.push(id);
    }
};

const isExpanded = (brokerId: number) => {
    return expandedRows.value.includes(brokerId.toString());
};

const headers = [
    { title: 'Идентификатор', key: 'id', sortable: true },
    { title: 'Имя', key: 'name', sortable: true },
    { title: 'Баланс', key: 'balance', sortable: true },
    { title: 'Акции', key: 'data-table-expand', sortable: false },
];
</script>

<template>
    <v-data-table :headers="headers" :items="brokers" density="default" fixed-header hover
        :sort-by="[{ key: 'id', order: 'asc' }]" :expand-on-click="false" show-expand v-model:expanded="expandedRows"
        item-value="id" :items-per-page="-1" :items-per-page-options="[
            { value: -1, title: 'Все' },
            { value: 5, title: '5' },
            { value: 10, title: '10' },
            { value: 25, title: '25' }
        ]" items-per-page-text="Элементов на странице">
        <template v-slot:item.stocks="{ item }">
            <ul v-if="item.stocks" class="ma-0 pa-0" style="list-style-position: inside;">
                <li v-for="(quantity, symbol) in item.stocks" :key="symbol">
                    {{ symbol }}: {{ quantity }}
                </li>
            </ul>
            <span v-else>—</span>
        </template>
        <template v-slot:expanded-row="{ columns, item }">
            <tr>
                <td :colspan="columns.length" class="pa-4">
                    <FinanceChartCard :broker="item" :stock-prices="props.stockPrices || {}" />
                </td>
            </tr>
        </template>
    </v-data-table>
</template>

<style lang="scss" scoped></style>