import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { createPinia } from 'pinia';
import { MotionPlugin } from '@vueuse/motion';
import tailwindMergeVueDirective from 'tailwind-merge-vue-directive';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { indexedDbPlugin, setPreloadedStoreData } from './stores/plugins/indexedDbPlugin';
import { initializeStoresFromDB } from './stores/plugins/initializeStores';
import { createHead } from '@vueuse/head';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
pinia.use(indexedDbPlugin);

// Créer et enregistrer le head manager pour que useHead fonctionne
const head = createHead();

// Pré-charge les données de la DB
initializeStoresFromDB().then(data => {
  setPreloadedStoreData(data);
  
  createApp(App)
    .use(pinia)
    .use(router)
    .use(head)
    .use(MotionPlugin)
    .use(tailwindMergeVueDirective)
    .mount('#app');
});
