import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { createPinia } from 'pinia';
import { MotionPlugin } from '@vueuse/motion';
import tailwindMergeVueDirective from 'tailwind-merge-vue-directive';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

createApp(App)
  .use(pinia)
  .use(router)
  .use(MotionPlugin)
  .use(tailwindMergeVueDirective)
  .mount('#app')
