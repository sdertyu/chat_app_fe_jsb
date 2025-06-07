// import './assets/main.css'
// import 'bootstrap/dist/css/bootstrap.css'
// import 'primevue/resources/themes/saga-blue/theme.css' // Hoặc theme bạn đang sử dụng
// import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import PrimeVue from 'primevue/config'
import './assets/css/style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
// import DialogService from 'primevue/dialogservice'
// import ToastService from 'primevue/toastservice'
// import ConfirmationService from 'primevue/confirmationservice'
import Aura from '@primeuix/themes/aura'
import vClickOutside from 'click-outside-vue3'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: 'system',
      cssLayer: false,
    },
  },
})

// app.use(ConfirmationService)
// app.use(ToastService)
// app.use(DialogService)
app.use(vClickOutside)
app.mount('#app')

import './bootstrap'
