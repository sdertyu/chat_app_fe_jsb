<script setup lang="ts">
import type { Ref } from "vue";
import type { IConversation } from "@/types";

import useStore from "@/stores/store";
import { ref, inject, onMounted, nextTick } from "vue";
import { getConversationIndex } from "@/utils";

import {
  CheckIcon,
  FaceSmileIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  XCircleIcon,
} from "@heroicons/vue/24/outline";
import AttachmentsModal from "@/components/shared/modals/AttachmentsModal/AttachmentsModal.vue";
import Button from "@/components/ui/inputs/Button.vue";
import IconButton from "@/components/ui/inputs/IconButton.vue";
import ScaleTransition from "@/components/ui/transitions/ScaleTransition.vue";
import ReplyMessage from "@/components/views/HomeView/Chat/ChatBottom/ReplyMessage.vue";
import EmojiPicker from "@/components/ui/inputs/EmojiPicker/EmojiPicker.vue";
import Textarea from "@/components/ui/inputs/Textarea.vue";
import { sendMessage, typing } from "@/plugins/stomp";
// import axios from '@/plugins/axios'

const store = useStore();

// const activeConversationId = getActiveConversationId()

const activeConversation = <IConversation>inject("activeConversation");

// the content of the message.
const value: Ref<string> = ref("");

// determines whether the app is recording or not.
const recording = ref(false);

// open emoji picker.
const showPicker = ref(false);

// open modal used to send multiple attachments attachments.
const openAttachmentsModal = ref(false);

// start and stop recording.
const handleToggleRecording = () => {
  recording.value = !recording.value;
};

// stop recording without sending.
const handleCancelRecording = () => {
  recording.value = false;
};

// close picker when you click outside.
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  const parent = target.parentElement as HTMLElement;

  if (
    target &&
    !target.classList.contains("toggle-picker-button") &&
    parent &&
    !parent.classList.contains("toggle-picker-button")
  ) {
    showPicker.value = false;
  }
};

// (event) set the draft message equals the content of the text area
const handleSetDraft = () => {
  const index = getConversationIndex(activeConversation.id);
  if (index !== undefined) {
    // console.log(index);
    store.conversations[index].draftMessage = value.value;
    console.log(store.conversations[index].draftMessage);
  }
  typing(
    "/app/chat.typing",
    {
      senderId: store.user?.id,
      conversationId: String(activeConversation.id),
    });
  // console.log(value.value);
  // socket.emit('typing', {
  //     senderId: store.user?.id,
  //     conversationId: String(activeConversationId),
  // })
};

// const typing = () => {
//     // console.log("Received typing event:");
//     socket.off('typing');
//     socket.on('typing2', (data) => {
//         console.log("Received typing event:", data);
//         console.log("objectffff");
//         if (data.conversationId == activeConversationId && data.senderId != store.user?.id) {
//             store.isTyping = true;

//             setTimeout(() => {
//                 store.isTyping = false;
//             }, 3000); // tự ẩn sau 3s
//         }
//     });
// };

const handleSendMessage = () => {
  if (value.value.trim() === "") {
    return;
  }

  sendMessage("/app/chat.send", {
    id: Number(null),
    senderId: store.user?.id,
    content: value.value,
    conversationId: activeConversation.id,
    createAt: null,
  });

  // if (activeConversationId !== undefined)
  //     console.log(store.conversations[activeConversationId].draftMessage);
  // socket.emit('sendMessage', {
  //     id: Number(null),
  //     senderId: store.user?.id,
  //     content: value.value,
  //     conversationId: activeConversation.id,
  //     createAt: null,
  // })

  nextTick(() => {
    value.value = "";
  });
};

onMounted(() => {
  value.value = activeConversation.draftMessage;
  // socket.on('typing', (data) => {
  //     // console.log('Received typing', data);
  //     if (data.conversationId == activeConversationId && data.senderId != store.user?.id) {
  //         store.isTyping = true
  //         setTimeout(() => {
  //             store.isTyping = false
  //         }, 3000)
  //     }
  // })
});
</script>

<template>
  <div class="w-full">
    <!--selected reply display-->
    <div class="relative transition-all duration-200" :class="{ 'pt-15': activeConversation?.replyMessage }">
      <ReplyMessage />
    </div>

    <div class="h-auto min-h-21 p-5 flex items-end" v-if="store.status !== 'loading'"
      :class="recording ? ['justify-between'] : []">
      <div class="min-h-[2.75rem]">
        <!--select attachments button-->
        <IconButton v-if="!recording" class="ic-btn-ghost-primary w-7 h-7 md:mr-5 xs:mr-4"
          title="open select attachments modal" aria-label="open select attachments modal"
          @click="openAttachmentsModal = true">
          <PaperClipIcon class="w-[1.25rem] h-[1.25rem]" />
        </IconButton>

        <!--recording timer-->
        <p v-if="recording" class="body-1 text-indigo-300">00:11</p>
      </div>

      <!--message textarea-->
      <div class="grow md:mr-5 xs:mr-4 self-end" v-if="!recording">
        <div class="relative">
          <Textarea class="max-h-[5rem] pr-12.5 resize-none scrollbar-hidden" @update:modelValue="value = $event"
            @input="handleSetDraft" :value="value" auto-resize cols="30" rows="1" placeholder="Write your message here"
            aria-label="Write your message here" />

          <!--emojis-->
          <div class="absolute bottom-[.8125rem] right-0">
            <!--emoji button-->
            <IconButton title="toggle emoji picker" aria-label="toggle emoji picker" @click="showPicker = !showPicker"
              class="ic-btn-ghost-primary toggle-picker-button w-7 h-7 md:mr-5 xs:mr-4">
              <XCircleIcon v-if="showPicker" class="w-[1.25rem] h-[1.25rem]" />
              <FaceSmileIcon v-else class="w-[1.25rem] h-[1.25rem] text-gray-400 group-hover:text-indigo-300" />
            </IconButton>

            <!--emoji picker-->
            <ScaleTransition>
              <div v-click-outside="handleClickOutside" v-show="showPicker"
                class="absolute z-10 bottom-13.75 md:right-0 xs:right-[-5rem] mt-2">
                <div role="none">
                  <EmojiPicker :show="showPicker" />
                </div>
              </div>
            </ScaleTransition>
          </div>
        </div>
      </div>

      <div class="min-h-[2.75rem]">
        <!--cancel recording button-->
        <div v-if="recording" @click="handleCancelRecording">
          <Button class="ghost-danger ghost-text"> Cancel </Button>
        </div>
      </div>

      <div class="min-h-[2.75rem] flex">
        <!--finish recording button-->
        <IconButton v-if="recording" title="finish recording" aria-label="finish recording"
          @click="handleToggleRecording"
          class="relative group w-7 h-7 flex justify-center items-center outline-none rounded-full bg-indigo-300 hover:bg-green-300 dark:hover:bg-green-400 dark:focus:bg-green-400 focus:outline-none transition-all duration-200">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-300 group-hover:bg-green-300 opacity-40">
          </span>

          <MicrophoneIcon class="w-[1.25rem] h-[1.25rem] text-white group-hover:hidden" />
          <CheckIcon class="w-[1.25rem] h-[1.25rem] hidden text-white group-hover:block" />
        </IconButton>

        <!--start recording button-->
        <IconButton v-else @click="handleToggleRecording" title="start recording" aria-label="start recording"
          class="ic-btn-ghost-primary w-7 h-7 md:mr-5 xs:mr-4">
          <MicrophoneIcon class="w-[1.25rem] h-[1.25rem]" />
        </IconButton>

        <!--send message button-->
        <IconButton v-if="!recording" @click="handleSendMessage"
          class="ic-btn-contained-primary w-7 h-7 active:scale-110" title="send message" aria-label="send message">
          <PaperAirplaneIcon class="w-4.25 h-4.25" />
        </IconButton>
      </div>
    </div>

    <AttachmentsModal :open="openAttachmentsModal" :close-modal="() => (openAttachmentsModal = false)" />
  </div>
</template>

<style>
input[placeholder="Search emoji"] {
  background: rgba(0, 0, 0, 0);
}

.v3-emoji-picker .v3-header {
  border-bottom: 0;
}

.v3-emoji-picker .v3-footer {
  border-top: 0;
}
</style>
