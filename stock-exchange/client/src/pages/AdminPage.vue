<script setup lang="ts">
import BrokerCard from '@/shared/components/cards/BrokerCard.vue';
import { type Broker } from '@/interfaces/Broker';

interface Props {
    brokers?: Broker[];
}

defineProps<Props>();
</script>

<template>
    <v-main class="pa-4">
        <BrokerCard :broker="{
            id: 2,
            name: 'Jenny',
            balance: 5000,
            stocks: {
                AAPL: 10,
                GOOGL: 5,
                TSLA: 2
            }
        }" />
    </v-main>
</template>

<style lang="scss" scoped>
</style>