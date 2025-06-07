<script setup lang="ts">
import type { INotification } from "@/types";
import useStore from "@/stores/store";

import NoNotifications from "@/components/states/empty-states/NoNotifications.vue";
import Circle2Lines from "@/components/states/loading-states/Circle2Lines.vue";
import Notification from "@/components/views/HomeView/Sidebar/Notifications/Notification.vue";
import SidebarHeader from "@/components/views/HomeView/Sidebar/SidebarHeader.vue";

const store = useStore();
</script>

<template>
    <div>
        <SidebarHeader>
            <template v-slot:title>Notifications</template>
        </SidebarHeader>

        <div class="w-full h-full scroll-smooth scrollbar-hidden" style="overflow-x: visible; overflow-y: scroll">
            <Circle2Lines v-if="
                store.status === 'loading' ||
                (store.delayLoading &&
                    (store.notifications as INotification[]).length > 0)
            " v-for="item in 6" />

            <Notification v-else-if="store.status === 'success' && !store.delayLoading"
                v-for="(notification, index) in store.notifications" :notification="notification" :key="index" />

            <NoNotifications v-else />
        </div>
    </div>
</template>
