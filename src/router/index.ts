import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', component: () => import('@/views/home/Home.vue'), name: 'Home', meta: { title: 'Home', icon: "home", showInAside: false, showInMobileFooter: false } },
  { path: '/tournaments', component: () => import('@/views/tournaments/Tournaments.vue'), name: 'Tournois', meta: { title: 'Tournois', icon: "bs:trophy", showInAside: true, showInMobileFooter: true } },
  { path: '/leaderboard', component: () => import('@/views/leaderboard/Leaderboard.vue'), name: 'Classement', meta: { title: 'Classement', icon: "ic:leaderboard-star", showInAside: true, showInMobileFooter: true } },
  { path: '/game-proposals', component: () => import('@/views/notfound/NotFound.vue'), name: 'Propositions de jeux', meta: { title: 'Propositions de jeux', icon: "bx:upvote", showInAside: true, showInMobileFooter: true } },
  { path: '/badges', component: () => import('@/views/notfound/NotFound.vue'), name: 'Badges', meta: { title: 'Badges', icon: "ci:medal", showInAside: true, showInMobileFooter: false } },
  { path: '/members', component: () => import('@/views/notfound/NotFound.vue'), name: 'Membres', meta: { title: 'Membres', icon: "cl:users-group", showInAside: true, showInMobileFooter: false } },
  { path: '/games', component: () => import('@/views/notfound/NotFound.vue'), name: 'Jeux', meta: { title: 'Jeux', icon: "ca:game-console", showInAside: true, showInMobileFooter: false } },
  { path: '/profile', component: () => import('@/views/notfound/NotFound.vue'), name: 'Profil', meta: { title: 'Profil', icon: "cd:account", showInAside: false, showInMobileFooter: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router;