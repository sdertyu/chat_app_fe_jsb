<template>
    <div class="chat-header">
        <div class="chat-header-info">
            <Avatar :image="currentChat.avatar" size="large" shape="circle" />
            <div>
                <h3>{{ currentChat.name }}</h3>
                <p>Cody Fisher, Esther Howard, Jerome Bell, Kristin Watson,...</p>
            </div>
        </div>
        <div class="chat-header-actions">
            <Button icon="pi pi-phone" rounded text aria-label="Call" />
            <Button icon="pi pi-search" rounded text aria-label="Search" />
            <Button icon="pi pi-ellipsis-h" rounded text aria-label="More options" />
        </div>
    </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import type { Chat } from '@/views/LayoutView.vue';

interface Props {
    currentChat: Chat;
}

defineProps<Props>();
</script>

<style scoped>
.chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #e9e9e9;
}

.chat-header-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.chat-header-info h3 {
    margin: 0;
    font-size: 1.2rem;
}

.chat-header-info p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
}

.chat-header-actions {
    display: flex;
    gap: 8px;
}
</style>