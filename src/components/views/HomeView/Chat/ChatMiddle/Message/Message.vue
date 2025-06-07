<script setup lang="ts">
import type {
    IConversation,
    IMessage,
    IPreviewData,
    IRecording,
} from "@/types";
import type { Ref } from "vue";

import linkifyStr from "linkify-string";
import { inject, ref } from "vue";

import { getFullName, getMessageById } from "@/utils";

import Attachments from "@/components/views/HomeView/Chat/ChatMiddle/Message/Attachments.vue";
import LinkPreview from "@/components/views/HomeView/Chat/ChatMiddle/Message/LinkPreview.vue";
import MessageContextMenu from "@/components/views/HomeView/Chat/ChatMiddle/Message/MessageContextMenu.vue";
import Receipt from "@/components/views/HomeView/Chat/ChatMiddle/Message/Receipt.vue";
import Recording from "@/components/views/HomeView/Chat/ChatMiddle/Message/Recording.vue";
import MessagePreview from "@/components/views/HomeView/Chat/MessagePreview.vue";
import Seen from "@/components/views/HomeView/Chat/ChatMiddle/Message/Seen.vue";

const props = defineProps<{
    message: IMessage;
    followUp: boolean;
    self: boolean;
    divider?: boolean;
    selected?: boolean;
    checkLastRead: (message: IMessage) => string[];
    handleSelectMessage: (messageId: number) => void;
    handleDeselectMessage: (messageId: number) => void;
}>();

const activeConversation = <IConversation>inject("activeConversation");

const showContextMenu = ref(false);

const contextMenuCoordinations: Ref<{ x: number; y: number }> = ref({
    x: 0,
    y: 0,
});

// open context menu.
const handleShowContextMenu = (event: any) => {
    showContextMenu.value = true;
    contextMenuCoordinations.value = {
        x:
            window.innerWidth - 220 <= event.pageX
                ? window.innerWidth - 250
                : event.pageX,
        y:
            window.innerHeight - 300 <= event.pageY
                ? window.innerHeight - 250
                : event.pageY,
    };
};

// closes the context menu
const handleCloseContextMenu = () => {
    showContextMenu.value = false;
};

// close context menu when opening a new one.
const contextConfig = {
    handler: handleCloseContextMenu,
    events: ["contextmenu"],
};

// decide whether to show or hide avatar next to the image.
const hideAvatar = () => {
    if (props.divider && !props.self) {
        return false;
    } else {
        if (props.followUp) {
            return true;
        }
        if (props.self) {
            return true;
        }
    }
};

function formatDateSmart(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();

    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    if (isToday) {
        return date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    } else {
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }
}



// reply message
const replyMessage = getMessageById(activeConversation, props.message.replyTo);
</script>

<template>
    <div class="select-none">
        <!--sender name above message bubble-->
        <div v-if="!props.self && !props.followUp" class="flex mb-2 ms-0" :class="{ 'ml-[2.25rem]': !hideAvatar() }">
            <p class="text-sm font-semibold text-gray-600 dark:text-gray-400 ml-4">
                {{ getFullName(props.message.sender) }}
            </p>
        </div>

        <div class="xs:mb-6 md:mb-5 flex" :class="{ 'justify-end': props.self }">
            <!--avatar-->
            <div class="mr-4" :class="{ 'ml-[2.25rem]': props.followUp && !divider }">
                <div v-if="!hideAvatar()" :aria-label="getFullName(props.message.sender)" class="outline-none">
                    <div :style="{ backgroundImage: `url(${props.message.sender.avatar})` }"
                        class="w-[2.25rem] h-[2.25rem] bg-cover bg-center rounded-full"></div>
                </div>
            </div>

            <div class="flex items-end">
                <!--bubble-->
                <div @click="handleCloseContextMenu" v-click-outside="contextConfig"
                    @contextmenu.prevent="handleShowContextMenu"
                    class="group max-w-125 p-5 rounded-b-xl transition duration-500" :class="{
                        'rounded-tl-xl ml-4 order-2 bg-indigo-50 dark:bg-gray-600':
                            props.self && !props.selected,

                        'rounded-tr-xl mr-4 bg-gray-50 dark:bg-gray-600':
                            !props.self && !props.selected,

                        'rounded-tl-xl ml-4 order-2 bg-indigo-200 dark:bg-indigo-500':
                            props.self && props.selected,

                        'rounded-tr-xl mr-4 bg-indigo-200 dark:bg-indigo-500':
                            !props.self && props.selected,
                    }">
                    <!--reply to-->
                    <MessagePreview v-if="replyMessage" :message="replyMessage" :self="props.self" class="mb-5 px-3" />

                    <!--content-->
                    <p v-if="props.message.content && props.message.type !== 'recording'"
                        class="body-2 outline-none text-black opacity-60 dark:text-white dark:opacity-70" v-html="linkifyStr(props.message.content as string, {
                            className: props.self
                                ? 'text-black opacity-50'
                                : 'text-indigo-500 dark:text-indigo-300',
                            format: {
                                url: (value) =>
                                    value.length > 50 ? value.slice(0, 50) + `…` : value,
                            },
                        })
                            " tabindex="0"></p>

                    <!--recording-->
                    <div v-else-if="
                        props.message.content && props.message.type === 'recording'
                    ">
                        <Recording :recording="<IRecording>props.message.content" :self="props.self" />
                    </div>

                    <!--attachments-->
                    <Attachments v-if="(props.message.attachments as [])?.length > 0" :message="props.message"
                        :self="props.self" />

                    <!--link preview-->
                    <LinkPreview v-if="props.message.previewData && !props.message.attachments" :self="props.self"
                        :preview-data="props.message.previewData as IPreviewData" class="mt-5" />
                </div>

                <!--date-->
                <div :class="props.self ? ['ml-4', 'order-1'] : ['mr-4']">
                    <p class="body-1 text-black/70 dark:text-white/70 whitespace-pre">
                        {{ formatDateSmart(props.message.date) }}
                    </p>
                </div>

                <!--read receipt-->
                <Receipt v-if="props.self" :state="props.message.state" />
            </div>
        </div>
        <MessageContextMenu :selected="props.selected" :message="props.message" :show="showContextMenu"
            :left="contextMenuCoordinations.x" :top="contextMenuCoordinations.y"
            :handle-close-context-menu="handleCloseContextMenu" :handle-select-message="handleSelectMessage"
            :handle-deselect-message="handleDeselectMessage" />

        <div class="flex justify-end flex-row">
            <div v-for="(contact, index) in props.checkLastRead(message)" :key="index" class="inline-block me-2">
                <Seen :avatar="contact" />
            </div>
        </div>

    </div>
</template>
