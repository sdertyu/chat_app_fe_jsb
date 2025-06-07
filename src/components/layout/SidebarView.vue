<template>
    <div class="sidebar">
        <div class="logo-container">
            <Avatar icon="pi pi-shield" size="large" shape="square" class="logo" />
        </div>
        <div class="sidebar-content">
            <div class="sidebar-header">
                <h2>Chats</h2>
                <Button icon="pi pi-plus" rounded text aria-label="Add chat" />
            </div>
            <div class="search-container">
                <span class="p-input-icon-left w-full">
                    <!-- <i class="pi pi-search" /> -->
                    <InputText :value="searchQuery" @input="$emit('update:searchQuery', $event.target.value)"
                        placeholder="Search" class="w-100" />
                </span>
            </div>
            <div class="chat-tabs">
                <Button label="Chat" class="p-button-text active-tab" />
                <Button label="Call" class="p-button-text" />
            </div>
            <div class="chat-list">
                <div v-for="chat in filteredChats" :key="chat.id" class="chat-item"
                    :class="{ 'active': selectedChatId === chat.id }" @click="$emit('select-chat', chat.id)">
                    <Avatar :image="chat.avatar" size="large" shape="circle" />
                    <div class="chat-info">
                        <div class="chat-header">
                            <span class="chat-name">{{ chat.name }}</span>
                            <span class="chat-time">{{ chat.lastMessageTime }}</span>
                        </div>
                        <div class="chat-preview">
                            <span>{{ chat.lastMessage }}</span>
                            <Badge v-if="chat.unreadCount" :value="chat.unreadCount" severity="danger" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="sidebar-footer">
            <Avatar image="https://tamkytourism.com/wp-content/uploads/2025/02/avatar-vo-tri-9.jpg?height=50&width=50"
                size="large" shape="circle" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Avatar from 'primevue/avatar';
import Badge from 'primevue/badge';
import type { Chat } from '@/views/LayoutView.vue';

interface Props {
    chats: Chat[];
    selectedChatId: number;
    searchQuery: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'select-chat': [chatId: number];
    'update:searchQuery': [value: string];
}>();

// Computed properties
const filteredChats = computed((): Chat[] => {
    if (!props.searchQuery) return props.chats;
    return props.chats.filter(chat =>
        chat.name.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(props.searchQuery.toLowerCase())
    );
});
</script>

<style scoped>
.sidebar {
    display: flex;
    flex-direction: column;
    width: 350px;
    border-right: 1px solid #e9e9e9;
}

.logo-container {
    padding: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid #e9e9e9;
}

.logo {
    background-color: #000;
}

.sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
}


.sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.sidebar-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
}

.search-container {
    margin-bottom: 16px;
}

.chat-tabs {
    display: flex;
    margin-bottom: 16px;
    border-bottom: 1px solid #e9e9e9;
}

.active-tab {
    border-bottom: 2px solid #6366f1;
    color: #6366f1;
}

.chat-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.chat-item {
    display: flex;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.chat-item:hover,
.chat-item.active {
    background-color: #f5f5f5;
}

.chat-info {
    margin-left: 12px;
    flex: 1;
    overflow: hidden;
}

.chat-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
}

.chat-name {
    font-weight: 600;
}

.chat-time {
    font-size: 0.8rem;
    color: #666;
}

.chat-preview {
    display: flex;
    justify-content: space-between;
    color: #666;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.sidebar-footer {
    padding: 16px;
    border-top: 1px solid #e9e9e9;
    display: flex;
    justify-content: center;
}
</style>