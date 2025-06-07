<template>
    <div class="right-sidebar">
        <div class="profile-header">
            <Avatar image="https://tamkytourism.com/wp-content/uploads/2025/02/avatar-vo-tri-9.jpg?height=80&width=80"
                size="xlarge" shape="circle" />
            <h3>PrimeTek</h3>
            <p>@primetek</p>
            <div class="profile-actions">
                <Button icon="pi pi-phone" rounded text aria-label="Call" />
                <Button icon="pi pi-video" rounded text aria-label="Video" />
                <Button icon="pi pi-sign-out" rounded text aria-label="Sign out" />
                <Button icon="pi pi-info-circle" rounded text aria-label="Info" />
                <Button icon="pi pi-ellipsis-v" rounded text aria-label="More" />
            </div>
        </div>
        <div class="profile-settings">
            <div class="setting-item">
                <div class="setting-label">
                    <i class="pi pi-bell"></i>
                    <span>Notification</span>
                </div>
                <InputSwitch :modelValue="settings.notifications"
                    @update:modelValue="updateSetting('notifications', $event)" />
            </div>
            <div class="setting-item">
                <div class="setting-label">
                    <i class="pi pi-volume-up"></i>
                    <span>Sound</span>
                </div>
                <InputSwitch :modelValue="settings.sound" @update:modelValue="updateSetting('sound', $event)" />
            </div>
            <div class="setting-item">
                <div class="setting-label">
                    <i class="pi pi-download"></i>
                    <span>Save to downloads</span>
                </div>
                <InputSwitch :modelValue="settings.saveDownloads"
                    @update:modelValue="updateSetting('saveDownloads', $event)" />
            </div>
        </div>
        <div class="members-section">
            <div class="members-header">
                <h4>Members</h4>
                <Button label="See All" link />
            </div>
            <div class="members-list">
                <div v-for="member in members" :key="member.id" class="member-item">
                    <Avatar :image="member.avatar" size="large" shape="circle" />
                    <span>{{ member.name }}</span>
                    <Button icon="pi pi-chevron-right" text rounded />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import InputSwitch from 'primevue/inputswitch';
import type { Settings, Member } from '@/views/LayoutView.vue';

interface Props {
    settings: Settings;
    members: Member[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:settings': [settings: Settings];
}>();

const updateSetting = (key: keyof Settings, value: boolean): void => {
    const updatedSettings = { ...props.settings, [key]: value };
    emit('update:settings', updatedSettings);
};
</script>

<style scoped>
.right-sidebar {
    width: 300px;
    border-left: 1px solid #e9e9e9;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.profile-header {
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #e9e9e9;
}

.profile-header h3 {
    margin: 8px 0 0 0;
    font-size: 1.2rem;
}

.profile-header p {
    margin: 0;
    color: #666;
}

.profile-actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
}

.profile-settings {
    padding: 16px;
    border-bottom: 1px solid #e9e9e9;
}

.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
}

.setting-label {
    display: flex;
    align-items: center;
    gap: 8px;
}

.members-section {
    padding: 16px;
}

.members-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.members-header h4 {
    margin: 0;
    font-size: 1.1rem;
}

.members-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.member-item {
    display: flex;
    align-items: center;
    gap: 12px;
}

.member-item span {
    flex: 1;
}
</style>