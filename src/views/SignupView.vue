<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <!-- Toast -->
        <div v-if="toast.show" :class="[
            'fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300',
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        ]">
            <div class="flex items-center">
                <span class="mr-2">{{ toast.type === 'success' ? '✓' : '✗' }}</span>
                <span>{{ toast.message }}</span>
            </div>
        </div>

        <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Đăng ký</h2>

            <form @submit.prevent="onFormSubmit" class="space-y-4">
                <div>
                    <input v-model="formData.username" type="email" placeholder="Email"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        :class="{ 'border-red-500': errors.username }" />
                    <p v-if="errors.username" class="text-red-500 text-sm mt-1">{{ errors.username }}</p>
                </div>

                <div>
                    <input v-model="formData.password" type="password" placeholder="Mật khẩu"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        :class="{ 'border-red-500': errors.password }" />
                    <p v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password }}</p>
                </div>

                <div>
                    <input v-model="formData.phone" type="tel" placeholder="Số điện thoại"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        :class="{ 'border-red-500': errors.phone }" />
                    <p v-if="errors.phone" class="text-red-500 text-sm mt-1">{{ errors.phone }}</p>
                </div>

                <div>
                    <input v-model="formData.lastName" type="text" placeholder="Họ"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        :class="{ 'border-red-500': errors.lastName }" />
                    <p v-if="errors.lastName" class="text-red-500 text-sm mt-1">{{ errors.lastName }}</p>
                </div>

                <div>
                    <input v-model="formData.middleName" type="text" placeholder="Tên đệm"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        :class="{ 'border-red-500': errors.middleName }" />
                    <p v-if="errors.middleName" class="text-red-500 text-sm mt-1">{{ errors.middleName }}</p>
                </div>

                <div>
                    <input v-model="formData.firstName" type="text" placeholder="Tên"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        :class="{ 'border-red-500': errors.firstName }" />
                    <p v-if="errors.firstName" class="text-red-500 text-sm mt-1">{{ errors.firstName }}</p>
                </div>

                <div>
                    <input type="file" @change="onAdvancedUpload" accept="image/*"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>

                <div class="pt-4">
                    <button type="submit" :disabled="isLoading"
                        class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                        <span v-if="isLoading">Đang xử lý...</span>
                        <span v-else>Đăng ký</span>
                    </button>
                </div>
            </form>

            <p class="text-center mt-6 text-gray-600">
                Đã có tài khoản?
                <router-link to="/login" class="text-blue-600 hover:text-blue-800 font-semibold">Đăng nhập</router-link>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import axios from '@/plugins/axios_auth';

interface FormData {
    username: string;
    password: string;
    phone: string;
    firstName: string;
    lastName: string;
    middleName: string;
    avatar: File | null;
}

const formData = reactive<FormData>({
    username: '',
    password: '',
    phone: '',
    firstName: '',
    lastName: '',
    middleName: '',
    avatar: null
});

const errors = reactive<Record<string, string>>({});
const isLoading = ref(false);

const toast = reactive({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
});

const showToast = (message: string, type: 'success' | 'error') => {
    toast.message = message;
    toast.type = type;
    toast.show = true;

    setTimeout(() => {
        toast.show = false;
    }, 3000);
};

const validateForm = (): boolean => {
    // Clear previous errors
    Object.keys(errors).forEach(key => delete errors[key]);

    let isValid = true;

    if (!formData.username) {
        errors.username = 'Email là bắt buộc';
        isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.username)) {
        errors.username = 'Email không hợp lệ';
        isValid = false;
    }

    if (!formData.password) {
        errors.password = 'Mật khẩu là bắt buộc';
        isValid = false;
    } else if (formData.password.length < 6) {
        errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        isValid = false;
    }

    if (!formData.phone) {
        errors.phone = 'Số điện thoại là bắt buộc';
        isValid = false;
    }

    if (!formData.firstName) {
        errors.firstName = 'Tên là bắt buộc';
        isValid = false;
    }

    if (!formData.lastName) {
        errors.lastName = 'Họ là bắt buộc';
        isValid = false;
    }

    return isValid;
};

const onFormSubmit = async () => {
    if (!validateForm()) {
        showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
        return;
    }

    isLoading.value = true;

    try {
        const formDataToSend = new FormData();
        formDataToSend.append('email', formData.username);
        formDataToSend.append('password', formData.password);
        formDataToSend.append('phone', formData.phone);
        formDataToSend.append('firstName', formData.firstName);
        formDataToSend.append('lastName', formData.lastName);
        formDataToSend.append('middleName', formData.middleName);

        if (formData.avatar) {
            formDataToSend.append('file', formData.avatar);
        }

        const response = await axios.post('auth/register', formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.status === 201) {
            showToast('Đăng ký thành công!', 'success');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            showToast('Đăng ký thất bại', 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('Đăng ký thất bại', 'error');
    } finally {
        isLoading.value = false;
    }
};

const onAdvancedUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
        formData.avatar = file;
    }
};
</script>