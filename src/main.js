import { createApp } from 'vue'
import App from './App.vue'
import './assets/index.css'

const app = createApp(App)

const fontFamily = `${import.meta.env.VITE_APP_FONT_FAMILY || 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'}`
document.documentElement.style.setProperty('--vue-app-font-family', fontFamily)

app.mount('#app')
