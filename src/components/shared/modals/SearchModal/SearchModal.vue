<script setup lang="ts">
import type { IConversation } from "@/types";

import NoMessage from "@/components/states/empty-states/NoMessage.vue";
import Button from "@/components/ui/inputs/Button.vue";
import SearchInput from "@/components/ui/inputs/SearchInput.vue";
import Modal from "@/components/ui/utils/Modal.vue";
import MessageItem from "@/components/shared/modals/SearchModal/MessageItem.vue";
import ScrollBox from "@/components/ui/utils/ScrollBox.vue";

const props = defineProps<{
    open: boolean;
    closeModal: () => void;
    conversation: IConversation;
}>();
</script>

<template>
    <Modal :open="props.open" :close-modal="props.closeModal">
        <template v-slot:content>
            <div class="w-75 py-6 bg-white dark:bg-gray-800 rounded">
                <!--header-->
                <div class="mb-6 px-5 flex justify-between items-center">
                    <p id="modal-title" class="heading-1 text-black/70 dark:text-white/70" tabindex="0">
                        Messages
                    </p>

                    <Button @click="props.closeModal" class="outlined-danger ghost-text py-2 px-4" typography="body-4">
                        esc
                    </Button>
                </div>

                <!--search-->
                <div class="mx-5 mb-5">
                    <SearchInput />
                </div>

                <!--message-->
                <ScrollBox class="max-h-57.5 overflow-y-scroll">
                    <MessageItem v-if="props.conversation.messages.length > 0"
                        v-for="(message, index) in props.conversation.messages" :message="message" :key="index" />

                    <NoMessage vertical v-else />
                </ScrollBox>
            </div>
        </template>
    </Modal>
</template>
