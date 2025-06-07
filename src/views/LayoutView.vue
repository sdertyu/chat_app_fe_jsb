<template>
    <div class="chat-container">
        <!-- Sidebar Component -->
        <SidebarView :chats="chats" :selectedChatId="selectedChatId" :searchQuery="searchQuery"
            @update:searchQuery="searchQuery = $event" @select-chat="selectChat" />

        <!-- Main Chat Area -->
        <div class="main-chat">
            <!-- Header Component -->
            <HeaderView :currentChat="currentChat" />

            <div class="chat-messages" ref="messagesContainer">
                <div v-for="(message, index) in currentChat.messages" :key="index" class="message-container">
                    <div v-if="message.sender === 'system'" class="system-message">
                        <Avatar label="OS" shape="circle" size="small" />
                        <div class="message-bubble system">
                            {{ message.content }}
                        </div>
                    </div>
                    <div v-else class="user-message" :class="{ 'own-message': message.sender === 'self' }">
                        <Avatar v-if="message.sender !== 'self'" :image="message.avatar" shape="circle" />
                        <div class="message-bubble" :class="{ 'own': message.sender === 'self' }">
                            {{ message.content }}
                        </div>

                    </div>
                    <div v-if="getReadersOfMessage(message.id).length > 0" class="read-user" style="text-align: right;">
                        <span v-for="(user, index) in getReadersOfMessage(message.id)" :key="index">
                            <Avatar :image="user.avatar" shape="circle" size="small" />
                        </span>
                    </div>

                </div>
                <div class="chat-image-preview" v-if="currentChat.imagePreview">
                    <img :src="currentChat.imagePreview" alt="Dashboard preview" class="dashboard-preview" />
                </div>
            </div>

            <div v-if="isTyping" class="typing-indicator">
                Ai đó đang nhập...
            </div>


            <!-- Footer Component -->
            <FooterView v-model:newMessage="newMessage" @send-message="sendMessage" @input="handleTyping" />
        </div>

        <!-- Profile Sidebar Component -->
        <SidebarProfile :settings="settings" :members="members" @update:settings="settings = $event" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, onBeforeUnmount } from 'vue';
import SidebarView from '@/components/layout/SidebarView.vue';
import HeaderView from '@/components/layout/HeaderView.vue';
import FooterView from '@/components/layout/FooterView.vue';
import SidebarProfile from '@/components/layout/SidebarProfile.vue';
import Avatar from 'primevue/avatar';
import axios from '@/plugins/axios';
import socket from '@/plugins/socket';

// Types
export interface Message {
    id: number;
    sender: 'self' | 'other' | 'system';
    senderId: number;
    content: string;
    avatar?: string;
}

export interface Chat {
    id: number;
    name: string;
    avatar: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    messages: Message[];
    imagePreview?: string;
    members?: Member[];
}

export interface Member {
    id: number;
    name: string;
    avatar: string;
    lastMessage?: number;
}

export interface Settings {
    notifications: boolean;
    sound: boolean;
    saveDownloads: boolean;
}

// State
const searchQuery = ref('');
const selectedChatId = ref();
const newMessage = ref('');
const messagesContainer = ref<HTMLElement | null>(null);
const isTyping = ref(false);


// localStorage
const userId = localStorage.getItem('userId');
const userName = localStorage.getItem('userName');

const settings = ref<Settings>({
    notifications: true,
    sound: false,
    saveDownloads: false
});

const handleTyping = (): void => {
    socket.emit('typing', {
        senderId: userId,
        conversationId: String(selectedChatId.value)
    });
};

// Sample data
const chats = ref<Chat[]>([]);

const members = ref<Member[]>([
    // { id: 1, name: 'Robin Jonas', avatar: 'https://tamkytourism.com/wp-content/uploads/2025/02/avatar-vo-tri-9.jpg' },
    // { id: 2, name: 'Cameron Williamson', avatar: 'https://tamkytourism.com/wp-content/uploads/2025/02/avatar-vo-tri-9.jpg' },
    // { id: 3, name: 'Eleanor Pena', avatar: 'https://tamkytourism.com/wp-content/uploads/2025/02/avatar-vo-tri-9.jpg' },
    // { id: 4, name: 'Arlene McCoy', avatar: 'https://tamkytourism.com/wp-content/uploads/2025/02/avatar-vo-tri-9.jpg' },
    // { id: 5, name: 'Dianne Russell', avatar: 'https://tamkytourism.com/wp-content/uploads/2025/02/avatar-vo-tri-9.jpg' }
]);

// Computed properties
const currentChat = computed((): Chat => {

    return chats.value.find(chat => chat.id === selectedChatId.value) || chats.value[0] || [];
});

const getReadersOfMessage = (messageId: number) => {
    return currentChat.value?.members?.filter(member => member.lastMessage === messageId && String(member.id) != userId) || [];
};


const join_room = (conversationId: Number) => {
    // if (socket.connected) {
    socket.emit('join_room', { conversationId: String(selectedChatId.value) });
    // }
}

const leave_room = (conversationId: Number) => {
    socket.emit('leave_room', { conversationId: String(conversationId) });
}

const readMessage = (chatId: number) => {
    let chatLength = currentChat.value.messages.length;
    let lastMessageId = currentChat.value.messages[chatLength - 1]?.id || 0;
    socket.emit('read_message', { conversationId: String(chatId), lastMessageId: Number(lastMessageId), userId: Number(userId) });
}

watch(selectedChatId, (newId, oldVal) => {
    join_room(newId);
    readMessage(newId);
    leave_room(oldVal);
});

const join_user_room = () => {
    if (socket.connected) {
        socket.emit("joinUserRoom", { userId: Number(userId) });
    }
}

// Methods
const selectChat = (chatId: number): void => {
    selectedChatId.value = chatId;
    // Reset unread count when selecting a chat
    const chat = chats.value.find(c => c.id === chatId);
    if (chat) {
        chat.unreadCount = 0;
    }

    // Scroll to bottom of messages
    nextTick(() => {
        scrollToBottom();
    });
};

const sendMessage = (): void => {
    if (!newMessage.value.trim()) return;

    socket.emit('sendMessage', {
        id: Number(null),
        senderId: userId,
        content: newMessage.value,
        conversationId: selectedChatId.value,
        createAt: null
    });

    nextTick(() => {
        newMessage.value = '';
        scrollToBottom();
    });
};

const scrollToBottom = (): void => {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
};

const getListChat = async (): Promise<void> => {
    try {
        const response = await axios.get('/chat/conversations');
        if (response.status === 200) {
            selectedChatId.value = response.data[0].id;
            chats.value = response.data.map((chat: any) => ({
                id: chat.id,
                name: chat.name,
                avatar: chat.avatar || 'https://tamkytourism.com/wp-content/uploads/2025/02/avatar-vo-tri-9.jpg',
                lastMessage: chat.messages?.[chat.messages.length - 1]?.content || '',
                lastMessageTime: chat.messages?.[chat.messages.length - 1]?.createdAt
                    ? new Date(chat.messages[chat.messages.length - 1].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : chat.createdAt
                        ? new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '',
                unreadCount: chat.messages?.[chat.messages.length - 1]?.id - chat.participants.filter((member: any) => member.usersId == userId)[0].lastReadMessageId,
                messages: chat.messages.map((message: any) => ({
                    id: message.id,
                    sender: message.senderId == userId ? 'self' : 'other',
                    senderId: message.senderId,
                    content: message.content,
                    avatar: "https://tamkytourism.com/wp-content/uploads/2025/02/avatar-vo-tri-9.jpg",

                })),
                members: chat.participants.map((member: any) => ({
                    id: member.usersId,
                    name: "name",
                    avatar: member.avatar || 'https://tamkytourism.com/wp-content/uploads/2025/02/avatar-vo-tri-9.jpg',
                    lastMessage: member.lastReadMessageId || null,
                })),
            }))

        }
    } catch (error) {
        console.error('Error fetching chat list:', error);
        chats.value = [];
    }
    finally {
        // Scroll to bottom after fetching chats
        nextTick(() => {
            scrollToBottom();
        });
    }
};

const receive_message = () => {
    socket.on('receive_message', async (message) => {
        const chat = chats.value.find(c => c.id == message.conversationId);
        if (chat) {
            if (message.senderId != userId) {
                chat.unreadCount++;
                chat.lastMessage = message.content;
                chat.lastMessageTime = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            chat.messages.push({
                id: message.id,
                sender: message.senderId == userId ? 'self' : 'other',
                content: message.content,
                avatar: "",
                senderId: message.senderId,
            });

            readMessage(selectedChatId.value);
            isTyping.value = false;
            // Nếu là hội thoại hiện tại thì scroll xuống
            if (selectedChatId.value === message.conversationId) {
                nextTick(() => {
                    scrollToBottom();
                });
            }
        } else {
            try {
                const newChat = await axios.get(`/chat/conversations/${message.conversationId}`);
                if (newChat.status === 200) {
                    const chatData = newChat.data;
                    chats.value.push({
                        id: chatData.id,
                        name: chatData.name,
                        avatar: chatData.avatar || 'https://tamkytourism.com/wp-content/uploads/2025/02/avatar-vo-tri-9.jpg',
                        lastMessage: chatData.messages?.[chatData.messages.length - 1]?.content || '',
                        lastMessageTime: chatData.messages?.[chatData.messages.length - 1]?.createdAt
                            ? new Date(chatData.messages[chatData.messages.length - 1].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : chatData.createdAt
                                ? new Date(chatData.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : '',
                        unreadCount: 0,
                        messages: chatData.messages.map((message: any) => ({
                            id: message.id,
                            sender: message.senderId == userId ? 'self' : 'other',
                            senderId: message.senderId,
                            content: message.content,
                            avatar: "https://tamkytourism.com/wp-content/uploads/2025/02/avatar-vo-tri-9.jpg",

                        })),
                        members: chatData.participants.map((member: any) => ({
                            id: member.usersId,
                            name: "name",
                            avatar: member.avatar || 'https://tamkytourism.com/wp-content/uploads/2025/02/avatar-vo-tri-9.jpg',
                            lastMessage: member.lastReadMessageId || null,
                        })),
                    });
                }
            } catch (error) {
                console.error('Error fetching chat:', error);
            }

        }
        console.log(message);
    });
};


const typing = () => {
    socket.on('typing', (data) => {
        // console.log("object");
        if (data.conversationId == selectedChatId.value && data.senderId != userId) {
            isTyping.value = true;

            setTimeout(() => {
                isTyping.value = false;
            }, 3000); // tự ẩn sau 3s
        }
    });
};

const read_message = () => {
    socket.on('read_message', (data) => {
        const chat = chats.value.find(c => c.id == data.conversationId);
        // console.log(chat);
        if (chat) {
            const member = chat.members?.find(m => m.id == data.userId);
            // console.log(currentChat.value?.members);
            // console.log("f1");
            if (member) {
                // console.log("f2");
                member.lastMessage = data.lastMessageId;
                nextTick(() => {
                    scrollToBottom();
                });
            }
        }
    });
};

// Lifecycle hooks
onMounted(async () => {
    await getListChat();
    // scrollToBottom();

    // socket.on('connect', () => {
    join_room(selectedChatId.value);
    readMessage(selectedChatId.value);
    // });

    join_user_room();

    receive_message();
    typing();

    read_message();


});

onBeforeUnmount(() => {
    socket.off('receive_message');
    socket.off('connect');
    socket.off('typing2');
    socket.off('read_message');
    // socket.emit('leave_room', { conversationId: String(selectedChatId.value) });
    socket.emit('leave_user_room', { userId: Number(userId) });
});
</script>

<style scoped>
.chat-container {
    display: flex;
    height: 100vh;
    width: 100%;
    background-color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.main-chat {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.chat-messages {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.message-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.system-message,
.user-message {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    max-width: 80%;
}

.own-message {
    align-self: flex-end;
    flex-direction: row-reverse;
}

.message-bubble {
    padding: 12px 16px;
    border-radius: 18px;
    background-color: #f0f0f0;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-bubble.own {
    background-color: #6366f1;
    color: white;
}

.message-bubble.system {
    background-color: #f0f0f0;
}

.chat-image-preview {
    display: flex;
    justify-content: center;
    margin: 16px 0;
}

.dashboard-preview {
    max-width: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>