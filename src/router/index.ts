import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '../views/LoginView.vue'
// import LayoutView from '@/views/LayoutView.vue'
// import HomeView from '@/views/HomeView.vue'
import SignupView from '@/views/SignupView.vue'
import axios from '@/plugins/axios'
// import { disconnectSocket } from '@/plugins/socket'

import AccessView from '@/components/views/AccessView/AccessView.vue'
import HomeView from '@/components/views/HomeView/HomeView.vue'
import PasswordResetView from '@/components/views/PasswordResetView/PasswordResetView.vue'
import Chat from '@/components/views/HomeView/Chat/Chat.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/',
    //   name: 'home',
    //   redirect: '/home',
    //   component: LayoutView,
    //   meta: {
    //     requiresAuth: true, // Đánh dấu route này yêu cầu xác thực
    //   },
    //   children: [
    //     {
    //       path: 'home',
    //       component: HomeView,
    //     },
    //   ],
    // },
    // {
    //   path: '/login',
    //   name: 'login',
    //   component: LoginView,
    // },
    // {
    //   path: '/signup',
    //   component: SignupView,
    // },

    {
      path: '/chat/',
      name: 'Home',
      alias: '/',
      component: HomeView,
      meta: {
        requiresAuth: true, // Đánh dấu route này yêu cầu xác thực
      },
      children: [
        {
          path: '/chat/',
          alias: '/',
          name: 'No-Chat',
          component: Chat,
        },
        {
          path: '/chat/:id/',
          name: 'Chat',
          component: Chat,
        },
      ],
    },
    {
      path: '/access/:method/',
      name: 'Access',
      component: AccessView,
    },
    {
      path: '/reset/',
      name: 'Password Reset',
      component: PasswordResetView,
    },

    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/signup',
      component: SignupView,
    },
  ],
})

// router.beforeEach((to, from, next) => {
//   //console.log(window.innerWidth);
//   if (from.name === 'Chat' && to.name === 'Chat' && window.innerWidth <= 967)
//     next({ name: 'No-Chat' })
//   else next()
// })

router.beforeEach(async (to, from, next) => {
  if (!to.meta.requiresAuth) {
    // Nếu không cần auth và đang đi đến trang login/register, disconnect socket
    if (to.name === 'Access' || to.name === 'login') {
      //   disconnectSocket()
    }
    return next()
  }

  try {
    await axios.get('/auth/verify-token') // access token còn hạn
    return next()
  } catch (error) {
    try {
      // Nếu access token hết hạn, thử refresh
      await axios.post('/auth/refresh-token', null)

      // Sau khi refresh thành công, retry verify
      //   await axios.get('/auth/verify-token')
      return next(localStorage.getItem('redirectAfterLogin') || '/home')
    } catch (err) {
      console.error('Token expired or invalid', err)
      // Disconnect socket khi logout
      //   disconnectSocket()
      return next('/login')
    }
  }
})

export default router
