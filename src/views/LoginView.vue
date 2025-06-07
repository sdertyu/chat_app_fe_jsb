<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Đăng nhập</h2>
            <form @submit.prevent="onFormSubmit" class="space-y-4">
                <div>
                    <input 
                        v-model="formData.username"
                        type="email" 
                        placeholder="Email"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        :class="{ 'border-red-500': errors.username }"
                    />
                    <p v-if="errors.username" class="text-red-500 text-sm mt-1">{{ errors.username }}</p>
                </div>
                <div>
                    <input 
                        v-model="formData.password"
                        type="password" 
                        placeholder="Mật khẩu"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        :class="{ 'border-red-500': errors.password }"
                    />
                    <p v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password }}</p>
                </div>
                <div class="flex justify-center">
                    <button 
                        type="submit" 
                        :disabled="isSubmitting"
                        class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-8 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <span v-if="isSubmitting">Đang đăng nhập...</span>
                        <span v-else>Đăng nhập</span>
                    </button>
                </div>
            </form>
            <p class="text-center mt-6 text-gray-600">
                Chưa có tài khoản? 
                <router-link to="/signup" class="text-blue-600 hover:text-blue-800 font-medium">
                    Đăng ký
                </router-link>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import axios_auth from '@/plugins/axios_auth';
import router from '@/router';

interface FormData {
    username: string;
    password: string;
}

interface FormErrors {
    username?: string;
    password?: string;
}

const formData = reactive<FormData>({
    username: '',
    password: ''
});

const errors = reactive<FormErrors>({});
const isSubmitting = ref(false);

const validateForm = (): boolean => {
    // Clear previous errors
    Object.keys(errors).forEach(key => delete errors[key as keyof FormErrors]);

    let isValid = true;

    if (!formData.username.trim()) {
        errors.username = 'Email là bắt buộc';
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
        errors.username = 'Email không hợp lệ';
        isValid = false;
    }

    if (!formData.password.trim()) {
        errors.password = 'Mật khẩu là bắt buộc';
        isValid = false;
    }

    return isValid;
};

const onFormSubmit = async () => {
    if (!validateForm()) {
        return;
    }

    isSubmitting.value = true;

    try {
        const formDataToSend = new FormData();
        formDataToSend.append('email', formData.username);
        formDataToSend.append('password', formData.password);

        const login = await axios_auth.post('auth/login', formDataToSend);
        
        if (login.status === 200) {
            console.log(login.data.data.user);
            localStorage.setItem('userData', JSON.stringify(login.data.data.user)); 
            router.push('/');
        }
    } catch (error: any) {
        console.log(error.response);
        console.log(error.response.data.message);
        
        if (error.response) {
            const errorMessage = error.response.data.message || 'Đăng nhập thất bại';
            // You can add a toast notification here if needed
            errors.username = errorMessage;
        } else {
            errors.username = 'Đã xảy ra lỗi không xác định';
        }
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<style scoped>
.p-toast {
    z-index: 9999 !important;
}
</style>