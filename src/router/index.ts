import { useUserStore } from '@/stores/userStore';
import type { User } from '@/types/models';
import { createRouter, createWebHistory, type RouterOptions } from 'vue-router';

const routes: RouterOptions['routes'] = [
  { path: '/', component: () => import('@/views/home/Home.vue'), name: 'Home', meta: { title: 'Home', icon: "home", showInAside: false, showInMobileFooter: false, showInAdminBar: false } },
  { path: '/tournaments', component: () => import('@/views/tournaments/Tournaments.vue'), name: 'Tournois', meta: { title: 'Tournois', icon: "bs:trophy", showInAside: true, showInMobileFooter: true, showInAdminBar: false } },
  { path: '/tournaments/:tournamentId', component: () => import('@/views/tournaments/TournamentDetails.vue'), name: 'Détails du tournoi', meta: { title: 'Détails du tournoi', icon: null, showInAside: false, showInMobileFooter: false, showInAdminBar: false } },
  { path: '/leaderboard', component: () => import('@/views/leaderboard/Leaderboard.vue'), name: 'Classement', meta: { title: 'Classement', icon: "ic:leaderboard-star", showInAside: true, showInMobileFooter: true, showInAdminBar: false } },
  { path: '/game-proposals', component: () => import('@/views/proposals/Proposal.vue'), name: 'Propositions de jeux', meta: { title: 'Propositions de jeux', icon: "bx:upvote", showInAside: true, showInMobileFooter: true, showInAdminBar: false } },
  { path: '/badges', component: () => import('@/views/notfound/NotFound.vue'), name: 'Badges', meta: { title: 'Badges', icon: "ci:medal", showInAside: false, showInMobileFooter: false, showInAdminBar: false } },
  { path: '/members', component: () => import('@/views/notfound/NotFound.vue'), name: 'Membres', meta: { title: 'Membres', icon: "cl:users-group", showInAside: false, showInMobileFooter: false, showInAdminBar: false } },
  { path: '/games', component: () => import('@/views/notfound/NotFound.vue'), name: 'Jeux', meta: { title: 'Jeux', icon: "ca:game-console", showInAside: true, showInMobileFooter: false, showInAdminBar: false } },
  { path: '/profile/:userId?', component: () => import('@/views/profile/Profile.vue'), name: 'Profil', meta: { title: 'Profil', icon: "cd:account", showInAside: false, showInMobileFooter: true, showInAdminBar: false } },
  { path: '/:pathMatch(.*)', component: () => import('@/views/notfound/NotFound.vue'), name: 'NotFound', meta: { title: 'Page non trouvée', icon: null, showInAside: false, showInMobileFooter: false, showInAdminBar: false } }
]

const adminRoutes: RouterOptions['routes'] = [
  { path: '/admin', component: () => import('@/views/notfound/NotFound.vue'), name: 'Admin', meta: { title: 'Admin', icon: 'bx:shield-quarter', showInAside: (user: User) => user.role === "superadmin", showInMobileFooter: false, showInAdminBar: false }},
  { path: '/admin/users', component: () => import('@/views/admin/users/Users.vue'), name: 'Gestion des utilisateurs', meta: { title: 'Users', icon: 'bx:user', showInAside: false, showInMobileFooter: false, showInAdminBar: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes.concat(adminRoutes),
})

router.beforeEach((to, _) => {
  document.title = `ACSV2 - ${to.meta.title}`;

  document.getElementsByClassName('view')[0]?.scrollTo(0, 0);

  if (to.path === '/admin') {
    const userStore = useUserStore();
    if (!userStore.user || userStore.user.role !== "superadmin") {
      return { path: '/not-found' };
    }
  }
})

export default router;