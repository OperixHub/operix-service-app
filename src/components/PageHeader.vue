<script setup>
defineProps({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        default: ''
    },
    badge: {
        type: String,
        default: ''
    }
});
</script>

<template>
    <header class="page-hero">
        <div class="page-hero__content">
            <span v-if="badge" class="page-hero__badge">{{ badge }}</span>
            <h1 class="page-hero__title">{{ title }}</h1>
            <p v-if="subtitle" class="page-hero__subtitle">{{ subtitle }}</p>
        </div>
        <div v-if="$slots.actions" class="page-hero__actions">
            <slot name="actions" />
        </div>
    </header>
</template>
