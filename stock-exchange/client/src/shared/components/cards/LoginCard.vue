<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Broker } from '@/interfaces/Broker';

const router = useRouter();
const username = ref<string>('');
const loading = ref<boolean>(false);
const error = ref<string>('');

const API_BASE = 'http://localhost:3000';

const login = async () => {
    if (!username.value.trim()) {
        error.value = 'Введите имя пользователя';
        return;
    }

    try {
        loading.value = true;
        error.value = '';

        const response = await fetch(`${API_BASE}/brokers/name/${encodeURIComponent(username.value)}`);
        const data = await response.json() as Broker & { found: boolean };

        if (data.found && data.id) {
            // Сохраняем ID брокера в localStorage
            localStorage.setItem('brokerId', data.id.toString());
            localStorage.setItem('brokerName', data.name);

            // Переходим на страницу брокера
            await router.push({ name: 'broker', params: { brokerId: data.id } });
        } else {
            error.value = 'Брокер с таким именем не найден';
        }
    } catch (err) {
        error.value = 'Ошибка подключения к серверу';
        console.error(err);
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <v-card variant="outlined" class="">
        <v-card-title>
            Вход в систему
        </v-card-title>
        <v-card-text>
            <v-text-field
                v-model="username"
                label="Имя брокера"
                variant="outlined"
                :disabled="loading"
                @keyup.enter="login"
            ></v-text-field>
            <v-alert v-if="error" type="error" class="mt-2">
                {{ error }}
            </v-alert>
        </v-card-text>
        <v-card-actions class="justify-end">
            <v-btn
                color="primary"
                variant="text"
                class="mr-2"
                :loading="loading"
                @click="login"
            >
                Войти
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<style lang="scss" scoped></style>