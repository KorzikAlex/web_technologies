<script setup lang="ts">
import ToolbarComponent from '@/shared/components/ToolbarComponent.vue';
</script>

<template>
    <ToolbarComponent :title="($route.meta.name as string)" />
    <v-app>
        <router-view />
    </v-app>
</template>
