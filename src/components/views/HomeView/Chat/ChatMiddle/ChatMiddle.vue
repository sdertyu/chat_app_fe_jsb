<script setup lang="ts">
import type { IConversation, IMessage } from "@/types";
import type { Ref } from "vue";
import { inject, onMounted, onUnmounted, ref } from "vue";
import useStore from "@/stores/store";
import emitter from '@/plugins/emitter';
import Message from "@/components/views/HomeView/Chat/ChatMiddle/Message/Message.vue";
import TimelineDivider from "@/components/views/HomeView/Chat/ChatMiddle/TimelineDivider.vue";

const props = defineProps<{
  handleSelectMessage: (messageId: number) => void;
  handleDeselectMessage: (messageId: number) => void;
  selectedMessages: number[];
}>();

const store = useStore();

const container: Ref<HTMLElement | null> = ref(null);

const activeConversation = <IConversation>inject("activeConversation");

// checks whether the previous message was sent by the same user.
const isFollowUp = (index: number, previousIndex: number): boolean => {
  if (previousIndex < 0) {
    return false;
  } else {
    let previousSender = activeConversation.messages[previousIndex].sender.id;
    let currentSender = activeConversation.messages[index].sender.id;
    return previousSender === currentSender;
  }
};

// checks whether the message is sent by the authenticated user.
const isSelf = (message: IMessage): boolean => {
  return Boolean(store.user && message.sender.id === store.user.id);
};

// checks wether the new message has been sent in a new day or not.
const renderDivider = (index: number, previousIndex: number): boolean => {
  if (index === 3) {
    return true;
  } else {
    return false;
  }
};

const scrollToBottom = () => {
  if (container.value) {
    (container.value as HTMLElement).scrollTop = (container.value as HTMLElement).scrollHeight;
  }
};

const checkLastRead = (message: IMessage): string[] => {
  let contact = activeConversation.contacts;
  // console.log(contact);
  // console.log(store.user?.id);
  return contact
    .filter((c) => c.lastReadMessageId === message.id && c.id !== store.user?.id)
    .map((c) => c.avatar); // hoặc c.name nếu bạn cần tên
};

// defineExpose({
//   scrollToBottom,
// });

// scroll messages to bottom.
onMounted(() => {
  scrollToBottom();
  emitter.on("scrollToBottom", scrollToBottom);

  console.log(activeConversation.contacts.map((c) => c.lastReadMessageId));
});

onUnmounted(() => {
  emitter.off("scrollToBottom", scrollToBottom);
});
</script>

<template>
  <div ref="container" class="grow px-5 py-5 flex flex-col overflow-y-scroll scrollbar-hidden">
    <div v-if="store.status !== 'loading'" v-for="(message, index) in activeConversation.messages" :key="index">
      <TimelineDivider v-if="renderDivider(index, index - 1)" />

      <Message :message="message" :self="isSelf(message)" :follow-up="isFollowUp(index, index - 1)"
        :divider="renderDivider(index, index - 1)" :selected="props.selectedMessages.includes(message.id)"
        :handle-select-message="handleSelectMessage" :handle-deselect-message="handleDeselectMessage"
        :checkLastRead="checkLastRead" />
    </div>
  </div>
</template>
