import { useToastStore } from '@/stores/toastStore';
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
  { path: '/player-levels', component: () => import('@/views/player-levels/PlayerLevels.vue'), name: 'Niveaux de jeu', meta: { title: 'Niveaux de jeu', icon: "mdi:gamepad-level", showInAside: false, showInMobileFooter: false, showInAdminBar: false } },
  { path: '/settings', component: () => import('@/views/notfound/NotFound.vue'), name: 'Paramètres', meta: { title: 'Paramètres', icon: "ic:baseline-settings", showInAside: false, showInMobileFooter: false, showInAdminBar: false } },
  { path: '/:pathMatch(.*)', component: () => import('@/views/notfound/NotFound.vue'), name: 'NotFound', meta: { title: 'Page non trouvée', icon: null, showInAside: false, showInMobileFooter: false, showInAdminBar: false } }
]

const adminRoutes: RouterOptions['routes'] = [
  { path: '/admin', component: () => import('@/views/admin/Admin.vue'), name: 'Admin', meta: { title: 'Admin', icon: 'bs:shield-lock', showInAside: (user: User) => user.role === "superadmin", showInMobileFooter: false, showInAdminBar: true, order: 0 } },
  { path: '/admin/users', component: () => import('@/views/admin/users/Users.vue'), name: 'Gestion des utilisateurs', meta: { title: 'Users', icon: 'bx:user', showInAside: false, showInMobileFooter: false, showInAdminBar: true, order: 1 } },
  { path: '/admin/tournaments', component: () => import('@/views/admin/tournaments/Tournaments.vue'), name: 'Gestion des tournois', meta: { title: 'Tournois', icon: 'bx:trophy', showInAside: false, showInMobileFooter: false, showInAdminBar: true, order: 2 } },
  { path: '/admin/tournaments/:id', component: () => import('@/views/admin/tournaments/TournamentDetails.vue'), name: 'tournament-details', meta: { title: 'Détails Tournoi', icon: 'bx:trophy', showInAside: false, showInMobileFooter: false, showInAdminBar: false, order: -1 } },
  { path: '/admin/games', component: () => import('@/views/admin/games/Games.vue'), name: 'Gestion des jeux', meta: { title: 'Jeux', icon: 'bx:game', showInAside: false, showInMobileFooter: false, showInAdminBar: true, order: 3 } },
  { path: '/admin/player-levels', component: () => import('@/views/admin/player-levels/PlayerLevels.vue'), name: 'Gestion des niveaux', meta: { title: 'Niveaux de jeu', icon: 'mdi:gamepad-level', showInAside: false, showInMobileFooter: false, showInAdminBar: true, order: 4 } },
  { path: '/admin/seasons', component: () => import('@/views/admin/seasons/Seasons.vue'), name: 'Gestion des saisons', meta: { title: 'Saisons', icon: 'bx:medal', showInAside: false, showInMobileFooter: false, showInAdminBar: true, order: 5 } },
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes.concat(adminRoutes),
})

router.beforeEach((to, _) => {
  document.title = `ACSV2 - ${to.meta.title}`;

  document.getElementsByClassName('view')[0]?.scrollTo(0, 0);

  const userStore = useUserStore();
  const toastStore = useToastStore();

  if (to.path === '/admin') {
    if (!userStore.user || userStore.user.role !== "superadmin") {
      return { path: '/not-found' };
    }
  }
  if (to.path !== '/') {
    if (!userStore.isLoggedIn) {
      toastStore.error("Vous devez être connecté pour accéder à cette page.");
      return { path: '/' };
    }
  }
})

export default router;