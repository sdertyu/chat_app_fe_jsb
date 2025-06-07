import axios from './plugins/axios'
import axios_auth from './plugins/axios_auth'

declare global {
  interface Window {
    axios: any
    axios_auth: any
  }
}

window.axios = axios
window.axios_auth = axios_auth
