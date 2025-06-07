// src/services/api.js
import axios from 'axios';
import router from '@/router';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true 
});

// Interceptor xử lý response
api.interceptors.response.use(
  response => response,
  error => {
    // Kiểm tra nếu lỗi là 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // Lưu lại route hiện tại (nếu cần) để redirect sau khi đăng nhập lại
      const currentRoute = router.currentRoute.value.fullPath;
      if (currentRoute !== '/login') {
        localStorage.setItem('redirectAfterLogin', currentRoute);
      }
      
    //   // Chuyển hướng người dùng đến trang đăng nhập
    //   router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default api;