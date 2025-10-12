import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { createPinia } from 'pinia';
import { MotionPlugin } from '@vueuse/motion';
import tailwindMergeVueDirective from 'tailwind-merge-vue-directive';

const pinia = createPinia();

createApp(App)
  .use(pinia)
  .use(router)
  .use(MotionPlugin)
  .use(tailwindMergeVueDirective)
  .mount('#app')
