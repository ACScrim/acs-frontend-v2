import { useToastStore } from "@/stores/toastStore";
import { useUserStore } from "@/stores/userStore";
import type { User } from "@/types/models";
import { createRouter, createWebHistory, type RouterOptions } from "vue-router";

const routes: RouterOptions["routes"] = [
  {
    path: "/",
    component: () => import("@/views/home/Home.vue"),
    name: "Accueil",
    meta: {
      title: "Accueil",
      icon: "bs:house",
      showInAside: false,
      showInMobileFooter: true,
      showInAdminBar: false,
      mobileFooterOrder: 1,
    },
  },
  {
    path: "/tournaments",
    component: () => import("@/views/tournaments/Tournaments.vue"),
    name: "Tournois",
    meta: {
      title: "Tournois",
      icon: "bs:trophy",
      showInAside: true,
      showInMobileFooter: true,
      showInAdminBar: false,
      mobileFooterOrder: 2,
    },
  },
  {
    path: "/tournaments/:tournamentId",
    component: () => import("@/views/tournaments/TournamentDetails.vue"),
    name: "Détails du tournoi",
    meta: {
      title: "Détails du tournoi",
      icon: null,
      showInAside: false,
      showInMobileFooter: false,
      showInAdminBar: false,
    },
  },
  {
    path: "/leaderboard",
    component: () => import("@/views/leaderboard/Leaderboard.vue"),
    name: "Classement",
    meta: {
      title: "Classement",
      icon: "ic:leaderboard-star",
      showInAside: true,
      showInMobileFooter: true,
      showInAdminBar: false,
      mobileFooterOrder: 3,
    },
  },
  {
    path: "/game-proposals",
    component: () => import("@/views/proposals/Proposal.vue"),
    name: "Propositions de jeux",
    meta: {
      title: "Propositions de jeux",
      icon: "bx:upvote",
      showInAside: true,
      showInMobileFooter: false,
      showInAdminBar: false,
    },
  },
  {
    path: "/badges",
    component: () => import("@/views/notfound/NotFound.vue"),
    name: "Badges",
    meta: {
      title: "Badges",
      icon: "ci:medal",
      showInAside: false,
      showInMobileFooter: false,
      showInAdminBar: false,
    },
  },
  {
    path: "/members",
    component: () => import("@/views/notfound/NotFound.vue"),
    name: "Membres",
    meta: {
      title: "Membres",
      icon: "cl:users-group",
      showInAside: false,
      showInMobileFooter: false,
      showInAdminBar: false,
    },
  },
  {
    path: "/games",
    component: () => import("@/views/games/Games.vue"),
    name: "Jeux",
    meta: {
      title: "Jeux",
      icon: "ca:game-console",
      showInAside: true,
      showInMobileFooter: false,
      showInAdminBar: false,
    },
  },
  {
    path: "/profile/:userId?",
    component: () => import("@/views/profile/Profile.vue"),
    name: "Profil",
    meta: {
      title: "Profil",
      icon: "cd:account",
      showInAside: false,
      showInMobileFooter: true,
      showInAdminBar: false,
      mobileFooterOrder: 4,
    },
  },
  {
    path: "/player-levels",
    component: () => import("@/views/player-levels/PlayerLevels.vue"),
    name: "Niveaux de jeu",
    meta: {
      title: "Niveaux de jeu",
      icon: "lu:gamepad-2",
      showInAside: false,
      showInMobileFooter: false,
      showInAdminBar: false,
    },
  },
  {
    path: "/verify-membership",
    component: () => import("@/views/verify-membership/VerifyMembership.vue"),
    name: "VerifyMembership",
    meta: {
      title: "Vérification Discord",
      showInAdminBar: false,
      showInAside: false,
      showInMobileFooter: false,
    },
  },
  {
    path: "/badges",
    component: () => import("@/views/badges/Badges.vue"),
    name: "Badges",
    meta: {
      title: "Badges",
      showInAdminBar: false,
      showInAside: false,
      showInMobileFooter: false,
    },
  },
  {
    path: "/games/dailyQuiz",
    component: () => import("@/views/games/daily-quiz/DailyQuiz.vue"),
    name: "DailyQuiz",
    meta: {
      title: "Daily Quiz",
      icon: "md:outlined-quiz",
      showInAdminBar: false,
      showInAside: false,
      showInMobileFooter: false,
    },
  },
  {
    path: "/scrimdeck/creator",
    component: () => import("@/views/games/card-creator/CardCreator.vue"),
    name: "CardCreator",
    meta: {
      title: "Éditeur",
      showInAdminBar: false,
      showInAside: false,
      showInMobileFooter: false,
      icon: "io:outline-sparkles"
    },
  },
  {
    path: "/scrimdeck/collection",
    component: () => import("@/views/games/card-collection/CardCollection.vue"),
    name: "CardCollection",
    meta: {
      title: "Collection",
      showInAdminBar: false,
      showInAside: false,
      showInMobileFooter: false,
      icon: "ch:cards",
    },
  },
  {
    path: "/scrimdeck/booster",
    component: () => import("@/views/games/booster-shop/BoosterShop.vue"),
    name: "BoosterShop",
    meta: {
      title: "Ouvrir un booster",
      showInAdminBar: false,
      showInAside: false,
      showInMobileFooter: false,
      icon: "bx:solid-shopping-bags",
    },
  },
  {
    path: "/scrimdeck/trades",
    component: () => import("@/views/games/card-trades/CardTrades.vue"),
    name: "CardTrades",
    meta: {
      title: "Échanges",
      showInAdminBar: false,
      showInAside: false,
      showInMobileFooter: false,
      icon: "bx:transfer",
    },
  },
  {
    path: "/scrimdeck/trades/create",
    component: () => import("@/views/games/card-trades/CreateTrade.vue"),
    name: "CreateTrade",
    meta: {
      title: "Créer une offre",
      showInAdminBar: false,
      showInAside: false,
      showInMobileFooter: false,
    },
  },
  {
    path: "/scrimdeck/trades/me",
    component: () => import("@/views/games/card-trades/MyTrades.vue"),
    name: "MyTrades",
    meta: {
      title: "Mes échanges",
      showInAdminBar: false,
      showInAside: false,
      showInMobileFooter: false,
    },
  },
  {
    path: "/scrimdeck/trades/:id",
    component: () => import("@/views/games/card-trades/TradeDetails.vue"),
    name: "TradeDetails",
    meta: {
      title: "Détails de l'offre",
      showInAdminBar: false,
      showInAside: false,
      showInMobileFooter: false,
    },
  },
  {
    path: "/scrimdeck/fusion",
    component: () => import("@/views/games/card-fusion/CardFusion.vue"),
    name: "CardFusion",
    meta: {
      title: "Fusion de cartes",
      showInAdminBar: false,
      showInAside: false,
      showInMobileFooter: false,
      icon: "bx:merge",
    },
  },
  {
    path: "/games/acsdle",
    component: () => import("@/views/games/acsdle/Acsdle.vue"),
    name: "Acsdle",
    meta: {
      title: "Acsdle",
      showInAdminBar: false,
      showInAside: false,
      showInMobileFooter: false,
      icon: "fl:person-question-mark"
    },
  },
  {
    path: "/games/three-boxes",
    component: () => import("@/views/games/ThreeBoxesView.vue"),
    name: "ThreeBoxes",
    meta: {
      title: "3 boîtes",
      showInAdminBar: false,
      showInAside: false,
      showInMobileFooter: false,
      icon: "fa:box"
    },
  },
  {
    path: "/:pathMatch(.*)",
    component: () => import("@/views/notfound/NotFound.vue"),
    name: "NotFound",
    meta: {
      title: "Page non trouvée",
      icon: null,
      showInAside: false,
      showInMobileFooter: false,
      showInAdminBar: false,
    },
  },
];

const adminRoutes: RouterOptions["routes"] = [
  {
    path: "/admin",
    component: () => import("@/views/admin/Admin.vue"),
    name: "Admin",
    meta: {
      title: "Admin",
      icon: "bs:shield-lock",
      showInAside: (user: User) => user.role.includes("admin"),
      showInMobileFooter: false,
      showInAdminBar: (user: User) => user.role.includes("admin"),
      order: 0,
    },
  },
  {
    path: "/admin/users",
    component: () => import("@/views/admin/users/Users.vue"),
    name: "Gestion des utilisateurs",
    meta: {
      title: "Users",
      icon: "bx:user",
      showInAside: false,
      showInMobileFooter: false,
      showInAdminBar: (user: User) => user.role === "superadmin",
      order: 1,
    },
  },
  {
    path: "/admin/tournaments",
    component: () => import("@/views/admin/tournaments/Tournaments.vue"),
    name: "Gestion des tournois",
    meta: {
      title: "Tournois",
      icon: "bx:trophy",
      showInAside: false,
      showInMobileFooter: false,
      showInAdminBar: (user: User) => user.role.includes("admin"),
      order: 2,
    },
  },
  {
    path: "/admin/tournaments/:id",
    component: () => import("@/views/admin/tournaments/TournamentDetails.vue"),
    name: "tournament-details",
    meta: {
      title: "Détails Tournoi",
      icon: "bx:trophy",
      showInAside: false,
      showInMobileFooter: false,
      showInAdminBar: false,
      order: -1,
    },
  },
  {
    path: "/admin/games",
    component: () => import("@/views/admin/games/Games.vue"),
    name: "Gestion des jeux",
    meta: {
      title: "Jeux",
      icon: "bx:game",
      showInAside: false,
      showInMobileFooter: false,
      showInAdminBar: (user: User) => user.role.includes("admin"),
      order: 3,
    },
  },
  {
    path: "/admin/player-levels",
    component: () => import("@/views/admin/player-levels/PlayerLevels.vue"),
    name: "Gestion des niveaux",
    meta: {
      title: "Niveaux de jeu",
      icon: "lu:gamepad-2",
      showInAside: false,
      showInMobileFooter: false,
      showInAdminBar: (user: User) => user.role.includes("admin"),
      order: 4,
    },
  },
  {
    path: "/admin/seasons",
    component: () => import("@/views/admin/seasons/Seasons.vue"),
    name: "Gestion des saisons",
    meta: {
      title: "Saisons",
      icon: "bx:medal",
      showInAside: false,
      showInMobileFooter: false,
      showInAdminBar: (user: User) => user.role.includes("admin"),
      order: 5,
    },
  },
  {
    path: "/admin/proposals",
    component: () => import("@/views/admin/proposals/Proposal.vue"),
    name: "Gestion des propositions",
    meta: {
      title: "Propositions de jeux",
      icon: "bx:upvote",
      showInAside: false,
      showInMobileFooter: false,
      showInAdminBar: (user: User) => user.role.includes("admin"),
      order: 6,
    },
  },
  {
    path: "/admin/cards",
    component: () => import("@/views/admin/cards/Cards.vue"),
    name: "Gestion des cartes",
    meta: {
      title: "Cartes",
      icon: "ch:cards",
      showInAside: (user: User) => user.role.includes("card"),
      showInMobileFooter: false,
      showInAdminBar: true,
      order: 7,
    },
  },
  {
    path: "/admin/cards/:cardId/edit",
    component: () => import("@/views/games/card-creator/CardCreator.vue"),
    name: "AdminCardEdit",
    meta: {
      title: "Édition de carte",
      icon: "ch:cards",
      showInAside: false,
      showInMobileFooter: false,
      showInAdminBar: false,
    },
  },
  {
    path: "/admin/scrimium",
    component: () => import("@/views/admin/scrimium/Scrimiums.vue"),
    name: "Scrimium",
    meta: {
      title: "Scrimium",
      icon: "mc:currency-baht-fill",
      showInAside: false,
      showInMobileFooter: false,
      showInAdminBar: (user: User) => user.role === "superadmin",
      order: 8,
    },
  },
  {
    path: "/admin/discord",
    component: () => import("@/views/admin/discord/DiscordMessages.vue"),
    name: "Discord",
    meta: {
      title: "Discord",
      icon: "ak:discord-fill",
      showInAside: false,
      showInMobileFooter: false,
      showInAdminBar: (user: User) => user.role === "superadmin",
      order: 9,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes.concat(adminRoutes),
});

router.beforeEach((to, _) => {
  document.title = `ACS - ${to.meta.title}`;

  document.querySelector("section[data-acs-scroll-region]")?.scrollTo(0, 0);

  const userStore = useUserStore();
  const toastStore = useToastStore();

  if (to.path.startsWith("/admin")) {
    if (to.path === '/admin/cards' && userStore.user && userStore.user.role.includes("card")) {
      return true;
    }
    if (!userStore.user || !userStore.user.role.includes("admin")) {
      return { path: "/not-found" };
    }
  }
  if (
    to.path !== "/" &&
    to.path !== "/verify-membership" &&
    to.path !== "/api/auth/discord"
  ) {
    if (!userStore.isLoggedIn) {
      toastStore.error("Vous devez être connecté pour accéder à cette page.");
      return { path: "/" };
    }
  }
});

export default router;
