<script setup lang="ts">
import useStore from '@/stores/store'

import FadeTransition from '@/components/ui/transitions/FadeTransition.vue'
import Navigation from '@/components/views/HomeView/Navigation/Navigation.vue'
import Sidebar from '@/components/views/HomeView/Sidebar/Sidebar.vue'
import { getActiveConversationId } from '@/utils'
import { computed, onMounted, ref, type Ref, onBeforeUnmount, nextTick } from 'vue'
import type { IUser } from '@/types'
// import { connectSocket, getSocket, disconnectSocket } from "@/plugins/socket";
import { connectStomp, joinUserRoom } from '@/plugins/stomp'
import axios from '@/plugins/axios'
import emitter from '@/plugins/emitter'

const activeConversationId = computed(() => {
  return getActiveConversationId()
})

// const da = ref(false);
const localUser = JSON.parse(localStorage.getItem('userData') || '')

const user: Ref<IUser> = ref({
  id: Number(localUser.id),
  firstName: localUser.firstName || 'null',
  lastName: localUser.lastName || 'null',
  email: localUser.email || 'null',
  avatar: 'null',
  token: 'null',
  lastSeen: new Date(),
  contacts: [
    {
      id: 9,
      firstName: 'string',
      lastName: 'string',
      avatar: 'string',
      email: 'string',
      lastSeen: new Date(),
    },
  ],
})

const store = useStore()

onMounted(async () => {
  // Khởi tạo socket connection khi HomeView được mount
  // connectSocket();
  connectStomp(() => {
    joinUserRoom(async (message: any) => {
      const chat = store.conversations.find((c) => c.id == message.conversationId)
      if (chat) {
        const sender = chat.contacts.find((c) => c.id === message.senderId)
        if (sender)
          chat.messages.push({
            id: message.id,
            type: 'text',
            content: message.content,
            date: message.createdAt,
            sender: {
              id: sender.id,
              firstName: sender.firstName,
              lastName: sender.lastName,
              avatar: sender.avatar,
              email: sender.email,
              lastSeen: new Date(),
              lastReadMessageId: message.id,
            },
            state: 'unread',
          })

        store.isTyping = false
        nextTick(() => {
          // scrollToBottom()
          emitter.emit('scrollToBottom')
        })
      } else {
        try {
          const newChat = await axios.get(`/chat/conversations/${message.conversationId}`)
          if (newChat.status === 200) {
            const chatData = newChat.data
            store.addConversation(chatData)
          }
        } catch (error) {
          console.error('Error fetching chat:', error)
        }
      }
    })
  })

  await store.fetchConversations()

  store.status = 'success'
  store.user = user.value

  store.delayLoading = false
  // join_user_room();
})

onBeforeUnmount(() => {
  // Cleanup socket khi component bị unmount
  // const socket = getSocket();
  // if (socket) {
  //     socket.emit('leave_user_room', { userId: user.value.id });
  // }
  // disconnectSocket();
})
</script>

<template>
  <KeepAlive v-if="!store.delayLoading">
    <div
      class="xs:relative md:static h-full flex xs:flex-col md:flex-row overflow-hidden"
    >
      <!--navigation-bar-->
      <Navigation class="xs:order-1 md:order-none" />
      <!--sidebar-->
      <Sidebar
        class="xs:grow-1 md:grow-0 xs:overflow-y-scroll md:overflow-visible scrollbar-hidden"
      />
      <!--chat-->
      <div
        id="mainContent"
        class="xs:absolute xs:z-10 md:static grow h-full xs:w-full md:w-fit scrollbar-hidden bg-white dark:bg-gray-800 transition-all duration-500"
        :class="activeConversationId ? ['xs:-left-[0rem]', 'xs:static'] : ['xs:left-250']"
        role="region"
      >
        <router-view v-slot="{ Component }">
          <FadeTransition name="fade" mode="out-in">
            <component :is="Component" :key="activeConversationId" />
          </FadeTransition>
        </router-view>
      </div>
    </div>
  </KeepAlive>
</template>
