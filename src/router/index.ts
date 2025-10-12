import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', component: () => import('@/views/home/Home.vue'), name: 'Home', meta: { title: 'Home', icon: "home", showInAside: false } },
  { path: '/tournaments', component: () => import('@/components/UIKitDemo.vue'), name: 'Tournois', meta: { title: 'Tournois', icon: "bs:trophy", showInAside: true } },
  { path: '/leaderboard', component: () => import('@/components/UIKitDemo.vue'), name: 'Classement', meta: { title: 'Classement', icon: "ic:leaderboard-star", showInAside: true } },
  { path: '/game-proposals', component: () => import('@/components/UIKitDemo.vue'), name: 'Propositions de jeux', meta: { title: 'Propositions de jeux', icon: "bx:upvote", showInAside: true } },
  { path: '/badges', component: () => import('@/components/UIKitDemo.vue'), name: 'Badges', meta: { title: 'Badges', icon: "ci:medal", showInAside: true } },
  { path: '/members', component: () => import('@/components/UIKitDemo.vue'), name: 'Membres', meta: { title: 'Membres', icon: "cl:users-group", showInAside: true } },
  { path: '/games', component: () => import('@/components/UIKitDemo.vue'), name: 'Jeux', meta: { title: 'Jeux', icon: "ca:game-console", showInAside: true } },
  { path: '/profile', component: () => import('@/components/UIKitDemo.vue'), name: 'Profil', meta: { title: 'Profil', icon: "mdi:account", showInAside: false } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router;