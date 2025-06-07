<template>
    {{ data }}
</template>

<script setup lang="ts">
import axios from '@/plugins/axios';
import { onMounted, ref } from 'vue';

const data = ref<JSON>();

const testJWT = async () => {
    try {
        const response = await axios.get('/user/me')
        console.log(response.data);
        data.value = response.data;

    } catch (error) {
        console.error('Error fetching user data:', error);
    }


};

onMounted(() => {
    testJWT();

});
</script>