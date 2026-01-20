"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var App_vue_1 = require("./App.vue");
var router_1 = require("./router");
require("./style.css");
var pinia_1 = require("pinia");
var motion_1 = require("@vueuse/motion");
var tailwind_merge_vue_directive_1 = require("tailwind-merge-vue-directive");
var pinia_plugin_persistedstate_1 = require("pinia-plugin-persistedstate");
var indexedDbPlugin_1 = require("./stores/plugins/indexedDbPlugin");
var initializeStores_1 = require("./stores/plugins/initializeStores");
var pinia = (0, pinia_1.createPinia)();
pinia.use(pinia_plugin_persistedstate_1.default);
pinia.use(indexedDbPlugin_1.indexedDbPlugin);
// Pré-charge les données de la DB
(0, initializeStores_1.initializeStoresFromDB)().then(function (data) {
    (0, indexedDbPlugin_1.setPreloadedStoreData)(data);
    (0, vue_1.createApp)(App_vue_1.default)
        .use(pinia)
        .use(router_1.default)
        .use(motion_1.MotionPlugin)
        .use(tailwind_merge_vue_directive_1.default)
        .mount('#app');
});
