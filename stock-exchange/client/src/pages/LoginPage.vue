<script setup lang="ts">
import LoginCard from '@/shared/components/cards/LoginCard.vue';
</script>

<template>
    <v-app>
        <v-main class="">
            <v-container fluid class="fill-height">
                <v-row class="fill-height justify-center align-center">
                    <v-col cols="12" sm="8" md="4" lg="3">
                        <LoginCard />
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<style lang="scss" scoped></style>