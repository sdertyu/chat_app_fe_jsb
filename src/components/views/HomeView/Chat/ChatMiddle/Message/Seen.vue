<template>
    <div class="flex justify-end mb-4">
        <img :src="props.avatar" alt="seen"
            class="w-5 h-5 rounded-full object-cover border border-gray-200 dark:border-gray-600">
    </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
    avatar: string;
}>();
</script>