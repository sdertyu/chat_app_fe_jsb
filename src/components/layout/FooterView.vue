<template>
    <div class="chat-input mb-2">
        <div class="input-actions">
            <Button icon="pi pi-smile" rounded text aria-label="Emoji" />
            <Button icon="pi pi-paperclip" rounded text aria-label="Attach file" />
        </div>
        <InputText :value="newMessage" @input="$emit('update:newMessage', $event.target.value)"
            @keyup.enter="$emit('send-message')" placeholder="Write your message..." class="message-input" />
        <Button icon="pi pi-send" rounded severity="primary" aria-label="Send message" @click="$emit('send-message')" />
    </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';

interface Props {
    newMessage: string;
}

defineProps<Props>();

defineEmits<{
    'update:newMessage': [value: string];
    'send-message': [];
}>();
</script>

<style scoped>
.chat-input {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
    border-top: 1px solid #e9e9e9;

}

.input-actions {
    display: flex;
    gap: 4px;
}

.message-input {
    flex: 1;
}
</style>