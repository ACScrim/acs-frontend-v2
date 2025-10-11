import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { createPinia } from 'pinia';
import { MotionPlugin } from '@vueuse/motion';

const pinia = createPinia();

createApp(App)
  .use(pinia)
  .use(router)
  .use(MotionPlugin)
  .mount('#app')
