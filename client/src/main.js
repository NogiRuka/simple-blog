import { createApp } from 'vue'
import { router } from './common/router'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import naive from 'naive-ui'
import { createDiscreteApi } from 'naive-ui'
import axios from 'axios'

/**
 * axios
 * pinia
 * sass
 * vue-router
 * naive-ui
 * wangeditor
 */

axios.defaults.baseURL = 'http://localhost:8080'
const { message, dialog, notification } = createDiscreteApi(['message', 'dialog', 'notification'])

const app = createApp(App)

app.provide('axios', axios)
app.provide('message', message)
app.provide('dialog', dialog)
app.provide('notification', notification)

app.use(naive)
    .use(router)
    .use(createPinia())
    .mount('#app')

