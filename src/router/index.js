"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var toastStore_1 = require("@/stores/toastStore");
var userStore_1 = require("@/stores/userStore");
var vue_router_1 = require("vue-router");
var routes = [
    {
        path: "/",
        component: function () { return Promise.resolve().then(function () { return require("@/views/home/Home.vue"); }); },
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
        component: function () { return Promise.resolve().then(function () { return require("@/views/tournaments/Tournaments.vue"); }); },
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
        component: function () { return Promise.resolve().then(function () { return require("@/views/tournaments/TournamentDetails.vue"); }); },
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
        component: function () { return Promise.resolve().then(function () { return require("@/views/leaderboard/Leaderboard.vue"); }); },
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
        component: function () { return Promise.resolve().then(function () { return require("@/views/proposals/Proposal.vue"); }); },
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
        component: function () { return Promise.resolve().then(function () { return require("@/views/notfound/NotFound.vue"); }); },
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
        component: function () { return Promise.resolve().then(function () { return require("@/views/notfound/NotFound.vue"); }); },
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
        component: function () { return Promise.resolve().then(function () { return require("@/views/games/Games.vue"); }); },
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
        component: function () { return Promise.resolve().then(function () { return require("@/views/profile/Profile.vue"); }); },
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
        component: function () { return Promise.resolve().then(function () { return require("@/views/player-levels/PlayerLevels.vue"); }); },
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
        component: function () { return Promise.resolve().then(function () { return require("@/views/verify-membership/VerifyMembership.vue"); }); },
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
        component: function () { return Promise.resolve().then(function () { return require("@/views/badges/Badges.vue"); }); },
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
        component: function () { return Promise.resolve().then(function () { return require("@/views/games/daily-quiz/DailyQuiz.vue"); }); },
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
        component: function () { return Promise.resolve().then(function () { return require("@/views/games/card-creator/CardCreator.vue"); }); },
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
        component: function () { return Promise.resolve().then(function () { return require("@/views/games/card-collection/CardCollection.vue"); }); },
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
        component: function () { return Promise.resolve().then(function () { return require("@/views/games/booster-shop/BoosterShop.vue"); }); },
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
        path: "/games/acsdle",
        component: function () { return Promise.resolve().then(function () { return require("@/views/games/acsdle/Acsdle.vue"); }); },
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
        path: "/:pathMatch(.*)",
        component: function () { return Promise.resolve().then(function () { return require("@/views/notfound/NotFound.vue"); }); },
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
var adminRoutes = [
    {
        path: "/admin",
        component: function () { return Promise.resolve().then(function () { return require("@/views/admin/Admin.vue"); }); },
        name: "Admin",
        meta: {
            title: "Admin",
            icon: "bs:shield-lock",
            showInAside: function (user) { return user.role.includes("admin"); },
            showInMobileFooter: false,
            showInAdminBar: function (user) { return user.role.includes("admin"); },
            order: 0,
        },
    },
    {
        path: "/admin/users",
        component: function () { return Promise.resolve().then(function () { return require("@/views/admin/users/Users.vue"); }); },
        name: "Gestion des utilisateurs",
        meta: {
            title: "Users",
            icon: "bx:user",
            showInAside: false,
            showInMobileFooter: false,
            showInAdminBar: function (user) { return user.role === "superadmin"; },
            order: 1,
        },
    },
    {
        path: "/admin/tournaments",
        component: function () { return Promise.resolve().then(function () { return require("@/views/admin/tournaments/Tournaments.vue"); }); },
        name: "Gestion des tournois",
        meta: {
            title: "Tournois",
            icon: "bx:trophy",
            showInAside: false,
            showInMobileFooter: false,
            showInAdminBar: function (user) { return user.role.includes("admin"); },
            order: 2,
        },
    },
    {
        path: "/admin/tournaments/:id",
        component: function () { return Promise.resolve().then(function () { return require("@/views/admin/tournaments/TournamentDetails.vue"); }); },
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
        component: function () { return Promise.resolve().then(function () { return require("@/views/admin/games/Games.vue"); }); },
        name: "Gestion des jeux",
        meta: {
            title: "Jeux",
            icon: "bx:game",
            showInAside: false,
            showInMobileFooter: false,
            showInAdminBar: function (user) { return user.role.includes("admin"); },
            order: 3,
        },
    },
    {
        path: "/admin/player-levels",
        component: function () { return Promise.resolve().then(function () { return require("@/views/admin/player-levels/PlayerLevels.vue"); }); },
        name: "Gestion des niveaux",
        meta: {
            title: "Niveaux de jeu",
            icon: "lu:gamepad-2",
            showInAside: false,
            showInMobileFooter: false,
            showInAdminBar: function (user) { return user.role.includes("admin"); },
            order: 4,
        },
    },
    {
        path: "/admin/seasons",
        component: function () { return Promise.resolve().then(function () { return require("@/views/admin/seasons/Seasons.vue"); }); },
        name: "Gestion des saisons",
        meta: {
            title: "Saisons",
            icon: "bx:medal",
            showInAside: false,
            showInMobileFooter: false,
            showInAdminBar: function (user) { return user.role.includes("admin"); },
            order: 5,
        },
    },
    {
        path: "/admin/proposals",
        component: function () { return Promise.resolve().then(function () { return require("@/views/admin/proposals/Proposal.vue"); }); },
        name: "Gestion des propositions",
        meta: {
            title: "Propositions de jeux",
            icon: "bx:upvote",
            showInAside: false,
            showInMobileFooter: false,
            showInAdminBar: function (user) { return user.role.includes("admin"); },
            order: 6,
        },
    },
    {
        path: "/admin/cards",
        component: function () { return Promise.resolve().then(function () { return require("@/views/admin/cards/Cards.vue"); }); },
        name: "Gestion des cartes",
        meta: {
            title: "Cartes",
            icon: "ch:cards",
            showInAside: function (user) { return user.role.includes("card"); },
            showInMobileFooter: false,
            showInAdminBar: true,
            order: 7,
        },
    },
    {
        path: "/admin/cards/:cardId/edit",
        component: function () { return Promise.resolve().then(function () { return require("@/views/games/card-creator/CardCreator.vue"); }); },
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
        component: function () { return Promise.resolve().then(function () { return require("@/views/admin/scrimium/Scrimiums.vue"); }); },
        name: "Scrimium",
        meta: {
            title: "Scrimium",
            icon: "mc:currency-baht-fill",
            showInAside: false,
            showInMobileFooter: false,
            showInAdminBar: function (user) { return user.role === "superadmin"; },
            order: 8,
        },
    },
    {
        path: "/admin/discord",
        component: function () { return Promise.resolve().then(function () { return require("@/views/admin/discord/DiscordMessages.vue"); }); },
        name: "Discord",
        meta: {
            title: "Discord",
            icon: "ak:discord-fill",
            showInAside: false,
            showInMobileFooter: false,
            showInAdminBar: function (user) { return user.role === "superadmin"; },
            order: 9,
        },
    },
];
var router = (0, vue_router_1.createRouter)({
    history: (0, vue_router_1.createWebHistory)(),
    routes: routes.concat(adminRoutes),
});
router.beforeEach(function (to, _) {
    var _a;
    document.title = "ACS - ".concat(to.meta.title);
    (_a = document.querySelector("section[data-acs-scroll-region]")) === null || _a === void 0 ? void 0 : _a.scrollTo(0, 0);
    var userStore = (0, userStore_1.useUserStore)();
    var toastStore = (0, toastStore_1.useToastStore)();
    if (to.path.startsWith("/admin")) {
        if (to.path === '/admin/cards' && userStore.user && userStore.user.role.includes("card")) {
            return true;
        }
        if (!userStore.user || !userStore.user.role.includes("admin")) {
            return { path: "/not-found" };
        }
    }
    if (to.path !== "/" &&
        to.path !== "/verify-membership" &&
        to.path !== "/api/auth/discord") {
        if (!userStore.isLoggedIn) {
            toastStore.error("Vous devez être connecté pour accéder à cette page.");
            return { path: "/" };
        }
    }
});
exports.default = router;
