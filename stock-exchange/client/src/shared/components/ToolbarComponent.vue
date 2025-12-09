<script setup lang="ts">
import type { ToolbarActions } from '@/interfaces/ToolbarActions';


interface Props {
    title?: string,
    actions?: ToolbarActions
}

defineProps<Props>();

</script>

<template>
    <v-toolbar flat>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
    </v-toolbar>
</template>

<style scoped lang="scss"></style>