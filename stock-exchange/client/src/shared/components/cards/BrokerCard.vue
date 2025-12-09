<script setup lang="ts">
import { type Broker } from '@/interfaces/Broker';

interface Props {
    broker?: Broker;
}

defineProps<Props>();

</script>

<template>
    <v-card variant="outlined" class="ma-4 d-flex flex-row" max-width="600">
        <div class="d-flex flex-column">
            <v-card-title>
                {{ broker?.name }}
            </v-card-title>
            <v-card-subtitle>
                ИД: {{ broker?.id }}
            </v-card-subtitle>
        </div>
        <v-card-text>
            <p>Баланс: {{ broker?.balance }}</p>
            <p>Количество акций: {{ broker?.stocks ? Object.keys(broker.stocks).length : 0 }}</p>
        </v-card-text>
        <v-card-actions class="d-flex flex-column align-start panel">
            <v-expansion-panels class="my-4" accordion>
                <v-expansion-panel>
                    <v-expansion-panel-title expand-icon="mdi-chevron-down">
                        Акции
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <div v-if="broker?.stocks">
                            <div v-for="(quantity, stock) in broker.stocks" :key="stock"  class="stock-row">
                                {{ stock }}: {{ quantity }}
                                <v-btn small outlined class="ml-2">График</v-btn>
                            </div>
                        </div>
                        <div v-else>
                            Нет акций
                        </div>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-card-actions>
    </v-card>
</template>

<style lang="scss" scoped>
.panel {
    width: 100%;
    max-width: 300px;
}

.stock-row {
    display: flex;
    justify-content: space-between; /* оставляет название слева и кнопку справа */
    align-items: center;            /* вертикальное центрирование */
    width: 100%;
}

.v-card-title,
.v-card-subtitle,
.v-card-text {
    text-align: center;
}
</style>