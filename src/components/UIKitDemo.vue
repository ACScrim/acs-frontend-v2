<script setup lang="ts">
import { ref } from "vue";
import {
  Button,
  Card,
  Input,
  Modal,
  Badge,
  Avatar,
  Progress,
  Dropdown,
} from "@/components/ui";
import ToastContainer from "@/components/global/ToastContainer.vue";
import { useUIClasses } from "@/composables/useUIClasses";
import { useToast } from "@/composables/useToast";

// États pour les tests
const inputValue = ref("");
const inputEmail = ref("");
const inputPassword = ref("");
const inputError = ref("");
const loading = ref(false);
const isDarkMode = ref(false);

// États pour les nouveaux composants
const showModal = ref(false);
const showConfirmModal = ref(false);
const dropdownValue = ref("");
const multiDropdownValue = ref([]);
const progressValue = ref(65);
const xpProgress = ref(78);

// Composable UI et Toast
const { getGradientClasses, getTextGradientClasses, getAnimationClasses } =
  useUIClasses();
const { success, error, warning, info, gaming } = useToast();

// Données pour les dropdowns
const gameOptions = [
  { label: "League of Legends", value: "lol", icon: "🎮" },
  { label: "Valorant", value: "valorant", icon: "🔫" },
  { label: "Counter-Strike 2", value: "cs2", icon: "💥" },
  { label: "Rocket League", value: "rocket", icon: "🚗", disabled: true },
  { label: "Overwatch 2", value: "overwatch", icon: "⚡" },
];

const statusOptions = [
  { label: "En ligne", value: "online", icon: "🟢" },
  { label: "Absent", value: "away", icon: "🟡" },
  { label: "Occupé", value: "busy", icon: "🔴" },
  { label: "Hors ligne", value: "offline", icon: "⚫" },
];

// Méthodes de test
const handleButtonClick = () => {
  console.log("Button clicked!");
  gaming("Action gaming exécutée avec succès !");
};

const handleLoadingDemo = async () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    success("Chargement terminé !");
  }, 2000);
};

const handleCardClick = () => {
  console.log("Card clicked!");
  info("Card gaming sélectionnée");
};

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  if (isDarkMode.value) {
    document.documentElement.classList.add("dark");
    success("Mode sombre activé");
  } else {
    document.documentElement.classList.remove("dark");
    success("Mode clair activé");
  }
};

// Méthodes pour les toasts
const showToastExamples = () => {
  setTimeout(() => success("Achievement débloqué ! 🏆"), 100);
  setTimeout(() => warning("Connexion instable détectée"), 600);
  setTimeout(() => info("Nouveau tournoi disponible"), 1100);
  setTimeout(() => gaming("Combo x5 réalisé ! 🔥"), 1600);
};

const showErrorToast = () => {
  error("Connexion au serveur échouée", {
    actionText: "Réessayer",
    persistent: false,
  });
};

// Méthodes pour les modals
const openModal = () => {
  showModal.value = true;
};

const openConfirmModal = () => {
  showConfirmModal.value = true;
};

const confirmAction = () => {
  showConfirmModal.value = false;
  gaming("Action confirmée ! Vous rejoignez le tournoi 🎮");
};

// Animation du progress
const animateProgress = () => {
  const interval = setInterval(() => {
    progressValue.value += 2;
    if (progressValue.value >= 100) {
      progressValue.value = 100;
      clearInterval(interval);
      success("Mission accomplie ! 🏆");
    }
  }, 50);
};

const resetProgress = () => {
  progressValue.value = 65;
  xpProgress.value = 78;
};
</script>

<template>
  <div
    class="min-h-screen bg-[var(--acs-bg-primary)] text-[var(--acs-text-primary)] py-12"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header avec identité gaming -->
      <div class="text-center mb-12 relative">
        <!-- Bouton toggle dark mode -->
        <div class="absolute top-0 right-0">
          <Button
            @click="toggleDarkMode"
            variant="ghost"
            size="sm"
            :icon="isDarkMode ? '☀️' : '🌙'"
          >
            {{ isDarkMode ? "Mode Clair" : "Mode Sombre" }}
          </Button>
        </div>

        <!-- Logo et titre principal -->
        <div class="mb-8">
          <div
            class="inline-block p-6 rounded-2xl acs-bg-gradient-gaming acs-animate-glow mb-6"
          >
            <span class="text-6xl">🎮</span>
          </div>
          <h1
            :class="[
              getTextGradientClasses('gaming'),
              'text-5xl md:text-7xl font-bold mb-4',
            ]"
          >
            ACS UI Kit
          </h1>
          <p class="text-xl text-[var(--acs-text-secondary)] max-w-2xl mx-auto">
            Design System Gaming-First pour la communauté ACS
          </p>
        </div>

        <!-- Stats gaming style -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div
            class="bg-[var(--acs-bg-secondary)] border border-[var(--acs-border-primary)] rounded-xl p-4 acs-hover-lift"
          >
            <div class="text-2xl mb-1 acs-text-gradient-primary font-bold">
              15+
            </div>
            <div class="text-sm text-[var(--acs-text-muted)]">Composants</div>
          </div>
          <div
            class="bg-[var(--acs-bg-secondary)] border border-[var(--acs-border-primary)] rounded-xl p-4 acs-hover-lift"
          >
            <div class="text-2xl mb-1 acs-text-gradient-primary font-bold">
              7
            </div>
            <div class="text-sm text-[var(--acs-text-muted)]">Couleurs</div>
          </div>
          <div
            class="bg-[var(--acs-bg-secondary)] border border-[var(--acs-border-primary)] rounded-xl p-4 acs-hover-lift"
          >
            <div class="text-2xl mb-1 acs-text-gradient-primary font-bold">
              5
            </div>
            <div class="text-sm text-[var(--acs-text-muted)]">Variantes</div>
          </div>
          <div
            class="bg-[var(--acs-bg-secondary)] border border-[var(--acs-border-primary)] rounded-xl p-4 acs-hover-lift"
          >
            <div class="text-2xl mb-1 acs-text-gradient-primary font-bold">
              ∞
            </div>
            <div class="text-sm text-[var(--acs-text-muted)]">
              Possibilities
            </div>
          </div>
        </div>
      </div>

      <!-- Section Gaming Buttons -->
      <div class="mb-16">
        <Card variant="glass" class="mb-8">
          <template #header>
            <h2
              :class="[
                getTextGradientClasses('primary'),
                'text-3xl font-bold mb-2',
              ]"
            >
              🚀 Gaming Buttons
            </h2>
            <p class="text-[var(--acs-text-secondary)]">
              Boutons avec des effets gaming et des couleurs énergiques
            </p>
          </template>

          <!-- Hero Buttons -->
          <div class="space-y-6">
            <div class="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                :class="getGradientClasses('gaming')"
                class="text-white shadow-[var(--acs-shadow-primary)] font-bold"
                @click="handleButtonClick"
              >
                🎮 Jouer Maintenant
              </Button>
              <Button
                size="lg"
                color="success"
                variant="solid"
                @click="handleButtonClick"
              >
                ✨ Rejoindre le Tournoi
              </Button>
              <Button
                size="lg"
                color="danger"
                variant="outline"
                @click="handleButtonClick"
              >
                ⚔️ Mode Combat
              </Button>
            </div>

            <!-- Couleurs ACS -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-[var(--acs-text-primary)]">
                Palette ACS
              </h3>
              <div class="flex flex-wrap gap-3">
                <Button color="primary" @click="handleButtonClick"
                  >Primary Gaming</Button
                >
                <Button color="info" @click="handleButtonClick"
                  >Accent Cyber</Button
                >
                <Button color="success" @click="handleButtonClick"
                  >Success Victory</Button
                >
                <Button color="warning" @click="handleButtonClick"
                  >Warning Alert</Button
                >
                <Button color="danger" @click="handleButtonClick"
                  >Danger Critical</Button
                >
              </div>
            </div>

            <!-- Effets spéciaux -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-[var(--acs-text-primary)]">
                Effets Spéciaux
              </h3>
              <div class="flex flex-wrap gap-3">
                <Button
                  :class="[getAnimationClasses('glow'), 'acs-neon-primary']"
                  @click="handleButtonClick"
                >
                  🌟 Neon Effect
                </Button>
                <Button
                  :class="getAnimationClasses('pulse')"
                  color="danger"
                  @click="handleButtonClick"
                >
                  💥 Pulse Effect
                </Button>
                <Button
                  :loading="loading"
                  :class="getGradientClasses('neon')"
                  class="text-white"
                  @click="handleLoadingDemo"
                >
                  {{ loading ? "Loading..." : "⚡ Gradient Neon" }}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Section Gaming Cards -->
      <div class="mb-16">
        <h2
          :class="[
            getTextGradientClasses('primary'),
            'text-3xl font-bold mb-6',
          ]"
        >
          🃏 Gaming Cards
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Card Gaming Standard -->
          <Card variant="elevated" hoverable @click="handleCardClick">
            <template #header>
              <div class="flex items-center space-x-3">
                <div
                  :class="[
                    getGradientClasses('gaming'),
                    'w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold',
                  ]"
                >
                  🏆
                </div>
                <div>
                  <h3 class="font-bold text-[var(--acs-text-primary)]">
                    Leaderboard
                  </h3>
                  <p class="text-sm text-[var(--acs-text-muted)]">
                    Classements
                  </p>
                </div>
              </div>
            </template>
            <p class="text-[var(--acs-text-secondary)] mb-4">
              Consultez votre position dans les classements et vos statistiques
              de jeu.
            </p>
            <template #footer>
              <Button size="sm" variant="outline" class="w-full">
                Voir Plus →
              </Button>
            </template>
          </Card>

          <!-- Card Glass Effect -->
          <Card variant="glass" hoverable @click="handleCardClick">
            <template #header>
              <div class="flex items-center space-x-3">
                <div
                  :class="[
                    getGradientClasses('neon'),
                    'w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold',
                  ]"
                >
                  ⚔️
                </div>
                <div>
                  <h3 class="font-bold text-[var(--acs-text-primary)]">
                    Tournois
                  </h3>
                  <p class="text-sm text-[var(--acs-text-muted)]">Gaming Pro</p>
                </div>
              </div>
            </template>
            <p class="text-[var(--acs-text-secondary)] mb-4">
              Participez aux tournois esport et montrez vos skills gaming.
            </p>
            <template #footer>
              <Button
                size="sm"
                :class="getGradientClasses('primary')"
                class="w-full text-white"
              >
                Rejoindre 🚀
              </Button>
            </template>
          </Card>

          <!-- Card Cyber Style -->
          <Card variant="outlined" hoverable @click="handleCardClick">
            <template #header>
              <div class="flex items-center space-x-3">
                <div
                  :class="[
                    getGradientClasses('cyber'),
                    'w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold',
                  ]"
                >
                  💡
                </div>
                <div>
                  <h3 class="font-bold text-[var(--acs-text-primary)]">
                    Propositions
                  </h3>
                  <p class="text-sm text-[var(--acs-text-muted)]">Community</p>
                </div>
              </div>
            </template>
            <p class="text-[var(--acs-text-secondary)] mb-4">
              Proposez de nouveaux jeux et modes pour la communauté ACS.
            </p>
            <template #footer>
              <Button size="sm" color="warning" variant="soft" class="w-full">
                Proposer 💡
              </Button>
            </template>
          </Card>
        </div>
      </div>

      <!-- Section Gaming Inputs -->
      <div class="mb-16">
        <Card variant="elevated">
          <template #header>
            <h2
              :class="[
                getTextGradientClasses('primary'),
                'text-3xl font-bold mb-2',
              ]"
            >
              ⌨️ Gaming Inputs
            </h2>
            <p class="text-[var(--acs-text-secondary)]">
              Champs de saisie adaptés à l'expérience gaming
            </p>
          </template>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              v-model="inputValue"
              label="Pseudo Gaming"
              placeholder="Entrez votre pseudo"
              icon="🎮"
              helper-text="Votre identité dans l'arène"
            />

            <Input
              v-model="inputEmail"
              type="email"
              label="Email Gamer"
              placeholder="gamer@acs.pro"
              icon="📧"
              required
              variant="filled"
            />

            <Input
              v-model="inputPassword"
              type="password"
              label="Mot de passe sécurisé"
              placeholder="••••••••"
              icon="🔒"
              helper-text="Protégez votre compte gaming"
              variant="underline"
            />

            <Input
              v-model="inputError"
              label="Test d'erreur"
              placeholder="Test gaming error"
              state="error"
              error-message="Pseudo déjà utilisé dans l'arène"
              icon="⚠️"
            />
          </div>
        </Card>
      </div>

      <!-- Section Toasts & Notifications -->
      <div class="mb-16">
        <Card variant="glass">
          <template #header>
            <h2
              :class="[
                getTextGradientClasses('primary'),
                'text-3xl font-bold mb-2',
              ]"
            >
              🔔 Toasts & Notifications Gaming
            </h2>
            <p class="text-[var(--acs-text-secondary)]">
              Système de notifications avec effets gaming immersifs
            </p>
          </template>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Boutons pour tester les toasts -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-[var(--acs-text-primary)]">
                Types de notifications
              </h3>
              <div class="space-y-3">
                <Button
                  color="success"
                  class="w-full"
                  @click="showToastExamples"
                >
                  🎉 Démonstration Gaming
                </Button>
                <Button
                  color="danger"
                  variant="outline"
                  class="w-full"
                  @click="showErrorToast"
                >
                  ⚠️ Test Erreur
                </Button>
                <Button
                  :class="getGradientClasses('gaming')"
                  class="w-full text-white"
                  @click="gaming('Notification gaming spéciale ! ⚡')"
                >
                  ⚡ Toast Gaming Spécial
                </Button>
              </div>
            </div>

            <!-- Informations sur les toasts -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-[var(--acs-text-primary)]">
                Fonctionnalités
              </h3>
              <ul class="space-y-2 text-[var(--acs-text-secondary)]">
                <li class="flex items-center space-x-2">
                  <span class="text-[var(--acs-success-500)]">✅</span>
                  <span>5 types : Success, Error, Warning, Info, Gaming</span>
                </li>
                <li class="flex items-center space-x-2">
                  <span class="text-[var(--acs-success-500)]">✅</span>
                  <span>6 positions configurables</span>
                </li>
                <li class="flex items-center space-x-2">
                  <span class="text-[var(--acs-success-500)]">✅</span>
                  <span>Auto-close avec barre de progression</span>
                </li>
                <li class="flex items-center space-x-2">
                  <span class="text-[var(--acs-success-500)]">✅</span>
                  <span>Effets gaming : glow, pulse, gradients</span>
                </li>
                <li class="flex items-center space-x-2">
                  <span class="text-[var(--acs-success-500)]">✅</span>
                  <span>Actions personnalisables</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      <!-- Section Modals -->
      <div class="mb-16">
        <Card variant="glass">
          <template #header>
            <h2
              :class="[
                getTextGradientClasses('primary'),
                'text-3xl font-bold mb-2',
              ]"
            >
              🪟 Modals Gaming
            </h2>
            <p class="text-[var(--acs-text-secondary)]">
              Boîtes de dialogue avec effets glassmorphism et animations
            </p>
          </template>

          <div class="space-y-6">
            <!-- Boutons pour ouvrir les modals -->
            <div class="flex flex-wrap gap-4">
              <Button
                :class="getGradientClasses('gaming')"
                class="text-white"
                @click="openModal"
              >
                🚀 Modal Gaming
              </Button>
              <Button
                color="warning"
                variant="outline"
                @click="openConfirmModal"
              >
                ⚔️ Modal Confirmation
              </Button>
            </div>

            <!-- Informations -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3
                  class="text-lg font-semibold text-[var(--acs-text-primary)] mb-3"
                >
                  Fonctionnalités
                </h3>
                <ul class="space-y-2 text-[var(--acs-text-secondary)]">
                  <li>• Overlay avec blur effect</li>
                  <li>• Animations d'entrée/sortie</li>
                  <li>• Tailles configurables (sm, md, lg, xl, full)</li>
                  <li>• Position centrée ou custom</li>
                  <li>• Fermeture par Escape ou backdrop</li>
                </ul>
              </div>
              <div>
                <h3
                  class="text-lg font-semibold text-[var(--acs-text-primary)] mb-3"
                >
                  Gaming Features
                </h3>
                <ul class="space-y-2 text-[var(--acs-text-secondary)]">
                  <li>• Effets de glow et shadow gaming</li>
                  <li>• Bordures néon animées</li>
                  <li>• Glassmorphism backdrop</li>
                  <li>• Support du mode sombre</li>
                  <li>• Transitions fluides</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Section Badges & Avatars -->
      <div class="mb-16">
        <Card variant="elevated">
          <template #header>
            <h2
              :class="[
                getTextGradientClasses('primary'),
                'text-3xl font-bold mb-2',
              ]"
            >
              🏅 Badges & Avatars Gaming
            </h2>
            <p class="text-[var(--acs-text-secondary)]">
              Identité visuelle et statuts pour les gamers
            </p>
          </template>

          <div class="space-y-8">
            <!-- Badges -->
            <div>
              <h3
                class="text-lg font-semibold text-[var(--acs-text-primary)] mb-4"
              >
                🏆 Badges Gaming
              </h3>
              <div class="space-y-4">
                <!-- Badges achievements -->
                <div class="flex flex-wrap gap-3 items-center">
                  <Badge color="primary" size="lg" :pulsing="true"
                    >🏆 Champion</Badge
                  >
                  <Badge color="success" size="md">✅ Vérifié</Badge>
                  <Badge color="warning" size="sm">⚡ Pro</Badge>
                  <Badge color="danger" variant="outline">🔥 Legend</Badge>
                  <Badge color="info" variant="soft">🎮 Gamer</Badge>
                </div>

                <!-- Badges avec variants -->
                <div class="flex flex-wrap gap-3 items-center">
                  <Badge variant="solid" color="primary">Solid</Badge>
                  <Badge variant="outline" color="success">Outline</Badge>
                  <Badge variant="soft" color="warning">Soft</Badge>
                  <Badge variant="dot" color="danger">
                    <span class="ml-2">Status Online</span>
                  </Badge>
                </div>
              </div>
            </div>

            <!-- Avatars -->
            <div>
              <h3
                class="text-lg font-semibold text-[var(--acs-text-primary)] mb-4"
              >
                👤 Avatars Gaming
              </h3>
              <div class="space-y-4">
                <!-- Avatars avec statuts -->
                <div class="flex flex-wrap gap-4 items-center">
                  <Avatar
                    size="xl"
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128"
                    alt="Gamer 1"
                    status="online"
                    :bordered="true"
                  />
                  <Avatar
                    size="lg"
                    fallback="🎮"
                    status="busy"
                    status-position="top-right"
                  />
                  <Avatar size="md" fallback="ACS" status="away" />
                  <Avatar size="sm" fallback="👑" status="offline" />
                </div>

                <!-- Avatars avec badges -->
                <div class="flex flex-wrap gap-4 items-center">
                  <div class="relative">
                    <Avatar
                      size="lg"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128"
                      alt="Pro Gamer"
                      status="online"
                    >
                      <template #overlay>
                        <Badge
                          variant="solid"
                          color="warning"
                          size="xs"
                          class="absolute -top-1 -right-1"
                        >
                          PRO
                        </Badge>
                      </template>
                    </Avatar>
                  </div>
                  <div class="relative">
                    <Avatar size="lg" fallback="👑" status="busy">
                      <template #overlay>
                        <Badge
                          variant="solid"
                          color="primary"
                          size="xs"
                          class="absolute -bottom-1 -right-1"
                          :pulsing="true"
                        >
                          VIP
                        </Badge>
                      </template>
                    </Avatar>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Section Progress & Dropdowns -->
      <div class="mb-16">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Progress Bars -->
          <Card variant="glass">
            <template #header>
              <h3
                :class="[
                  getTextGradientClasses('primary'),
                  'text-2xl font-bold mb-2',
                ]"
              >
                📊 Progress Gaming
              </h3>
              <p class="text-[var(--acs-text-secondary)]">
                Barres de progression avec effets gaming
              </p>
            </template>

            <div class="space-y-6">
              <!-- Progress linéaires -->
              <div class="space-y-4">
                <Progress
                  :value="progressValue"
                  label="Mission en cours"
                  color="primary"
                  :animated="true"
                  :show-percentage="true"
                />
                <Progress
                  :value="xpProgress"
                  label="Expérience (XP)"
                  color="success"
                  :striped="true"
                  :animated="true"
                  :show-percentage="true"
                />
                <Progress
                  :value="45"
                  label="Niveau Tournoi"
                  color="warning"
                  size="lg"
                  :show-percentage="true"
                />
              </div>

              <!-- Progress circulaires -->
              <div class="flex justify-around items-center">
                <Progress
                  :value="85"
                  variant="circular"
                  color="primary"
                  size="lg"
                  :show-percentage="true"
                />
                <Progress
                  :value="67"
                  variant="circular"
                  color="success"
                  size="md"
                  :animated="true"
                  :show-percentage="true"
                />
                <Progress
                  :value="92"
                  variant="circular"
                  color="danger"
                  size="sm"
                  :show-percentage="true"
                />
              </div>

              <!-- Contrôles -->
              <div class="flex gap-3">
                <Button size="sm" @click="animateProgress"> 🚀 Animer </Button>
                <Button size="sm" variant="outline" @click="resetProgress">
                  🔄 Reset
                </Button>
              </div>
            </div>
          </Card>

          <!-- Dropdowns -->
          <Card variant="elevated">
            <template #header>
              <h3
                :class="[
                  getTextGradientClasses('primary'),
                  'text-2xl font-bold mb-2',
                ]"
              >
                📋 Dropdowns Gaming
              </h3>
              <p class="text-[var(--acs-text-secondary)]">
                Menus déroulants avec recherche et multi-sélection
              </p>
            </template>

            <div class="space-y-6">
              <!-- Dropdown simple -->
              <div>
                <label
                  class="block text-sm font-medium text-[var(--acs-text-primary)] mb-2"
                >
                  🎮 Jeu préféré
                </label>
                <Dropdown
                  v-model="dropdownValue"
                  :items="gameOptions"
                  placeholder="Choisir un jeu..."
                  size="md"
                />
              </div>

              <!-- Dropdown avec recherche -->
              <div>
                <label
                  class="block text-sm font-medium text-[var(--acs-text-primary)] mb-2"
                >
                  🔍 Jeu avec recherche
                </label>
                <Dropdown
                  v-model="dropdownValue"
                  :items="gameOptions"
                  placeholder="Rechercher un jeu..."
                  :searchable="true"
                  size="md"
                />
              </div>

              <!-- Dropdown multi-sélection -->
              <div>
                <label
                  class="block text-sm font-medium text-[var(--acs-text-primary)] mb-2"
                >
                  ⚡ Statuts disponibles
                </label>
                <Dropdown
                  v-model="multiDropdownValue"
                  :items="statusOptions"
                  placeholder="Sélectionner des statuts..."
                  :multiple="true"
                  :searchable="true"
                  size="md"
                />
              </div>

              <!-- Valeurs sélectionnées -->
              <div class="text-sm text-[var(--acs-text-secondary)]">
                <p>
                  <strong>Jeu sélectionné:</strong>
                  {{ dropdownValue || "Aucun" }}
                </p>
                <p>
                  <strong>Statuts:</strong>
                  {{
                    multiDropdownValue.length > 0
                      ? multiDropdownValue.join(", ")
                      : "Aucun"
                  }}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Section Technical Gaming Info -->
      <Card variant="glass">
        <template #header>
          <div class="flex items-center space-x-3">
            <div
              :class="[
                getGradientClasses('gaming'),
                getAnimationClasses('pulse'),
                'w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold',
              ]"
            >
              🛠️
            </div>
            <div>
              <h3
                :class="[
                  getTextGradientClasses('gaming'),
                  'text-2xl font-bold',
                ]"
              >
                ACS Gaming Design System
              </h3>
              <p class="text-[var(--acs-text-secondary)]">
                Architecture technique optimisée
              </p>
            </div>
          </div>
        </template>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Features -->
          <div>
            <h4
              class="text-lg font-semibold text-[var(--acs-text-primary)] mb-4"
            >
              🎮 Features Gaming
            </h4>
            <ul class="space-y-3 text-[var(--acs-text-secondary)]">
              <li class="flex items-center space-x-3">
                <span class="text-[var(--acs-success-500)]">✅</span>
                <span>Variables CSS personnalisées ACS</span>
              </li>
              <li class="flex items-center space-x-3">
                <span class="text-[var(--acs-success-500)]">✅</span>
                <span>Thème sombre/clair avec transitions</span>
              </li>
              <li class="flex items-center space-x-3">
                <span class="text-[var(--acs-success-500)]">✅</span>
                <span>Effets gaming : neon, glow, gradients</span>
              </li>
              <li class="flex items-center space-x-3">
                <span class="text-[var(--acs-success-500)]">✅</span>
                <span>Glassmorphism et hover effects</span>
              </li>
              <li class="flex items-center space-x-3">
                <span class="text-[var(--acs-success-500)]">✅</span>
                <span>Palette de couleurs esport</span>
              </li>
            </ul>
          </div>

          <!-- Tech Stack -->
          <div>
            <h4
              class="text-lg font-semibold text-[var(--acs-text-primary)] mb-4"
            >
              ⚡ Tech Stack
            </h4>
            <div class="space-y-2">
              <div
                class="flex items-center justify-between p-3 bg-[var(--acs-bg-tertiary)] rounded-lg"
              >
                <span class="text-[var(--acs-text-secondary)]"
                  >Vue 3 + TypeScript</span
                >
                <span class="text-[var(--acs-success-500)] text-sm"
                  >✨ Latest</span
                >
              </div>
              <div
                class="flex items-center justify-between p-3 bg-[var(--acs-bg-tertiary)] rounded-lg"
              >
                <span class="text-[var(--acs-text-secondary)]"
                  >Tailwind CSS v4</span
                >
                <span class="text-[var(--acs-success-500)] text-sm"
                  >🔥 New</span
                >
              </div>
              <div
                class="flex items-center justify-between p-3 bg-[var(--acs-bg-tertiary)] rounded-lg"
              >
                <span class="text-[var(--acs-text-secondary)]"
                  >Variables CSS</span
                >
                <span class="text-[var(--acs-accent-500)] text-sm"
                  >⚡ Fast</span
                >
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex flex-wrap gap-3">
            <Button
              :class="getGradientClasses('gaming')"
              class="text-white"
              @click="handleButtonClick"
            >
              🚀 Commencer à développer
            </Button>
            <Button variant="outline" color="info" @click="handleButtonClick">
              📚 Documentation
            </Button>
            <Button variant="ghost" color="gray" @click="handleButtonClick">
              💾 Télécharger
            </Button>
          </div>
        </template>
      </Card>
    </div>

    <!-- Modals -->
    <!-- Modal Gaming Principal -->
    <Modal v-model="showModal" size="lg" :backdrop-blur="true">
      <template #header>
        <div class="flex items-center space-x-3">
          <div
            :class="[
              getGradientClasses('gaming'),
              'w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold',
            ]"
          >
            🎮
          </div>
          <div>
            <h3
              :class="[getTextGradientClasses('gaming'), 'text-2xl font-bold']"
            >
              Welcome to ACS Gaming
            </h3>
            <p class="text-[var(--acs-text-secondary)]">
              Votre hub gaming ultime
            </p>
          </div>
        </div>
      </template>

      <div class="space-y-6">
        <div class="text-center">
          <div
            :class="[
              getGradientClasses('neon'),
              'inline-block p-6 rounded-2xl mb-4',
            ]"
          >
            <span class="text-4xl">🚀</span>
          </div>
          <h4 class="text-xl font-bold text-[var(--acs-text-primary)] mb-2">
            Prêt pour l'aventure ?
          </h4>
          <p class="text-[var(--acs-text-secondary)]">
            Rejoignez la communauté ACS et participez aux tournois les plus
            épiques du gaming français !
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="text-center p-4 bg-[var(--acs-bg-secondary)] rounded-xl">
            <div class="text-2xl mb-2 acs-text-gradient-primary font-bold">
              500+
            </div>
            <div class="text-sm text-[var(--acs-text-muted)]">Gamers</div>
          </div>
          <div class="text-center p-4 bg-[var(--acs-bg-secondary)] rounded-xl">
            <div class="text-2xl mb-2 acs-text-gradient-primary font-bold">
              50+
            </div>
            <div class="text-sm text-[var(--acs-text-muted)]">Tournois</div>
          </div>
        </div>

        <div class="bg-[var(--acs-bg-tertiary)] rounded-xl p-4">
          <h5 class="font-semibold text-[var(--acs-text-primary)] mb-2">
            🏆 Dernières réussites
          </h5>
          <ul class="space-y-2 text-sm text-[var(--acs-text-secondary)]">
            <li>• Champion League of Legends S13</li>
            <li>• Finaliste Valorant Masters</li>
            <li>• Organisateur CS2 Community Cup</li>
          </ul>
        </div>
      </div>

      <template #footer="{ close }">
        <div class="flex justify-end space-x-3">
          <Button variant="outline" @click="close"> Fermer </Button>
          <Button
            :class="getGradientClasses('gaming')"
            class="text-white"
            @click="close"
          >
            🚀 Rejoindre ACS
          </Button>
        </div>
      </template>
    </Modal>

    <!-- Modal Confirmation -->
    <Modal
      v-model="showConfirmModal"
      size="md"
      :closable="false"
      :persistent="true"
    >
      <template #header>
        <div class="flex items-center space-x-3">
          <div
            class="w-12 h-12 rounded-xl bg-[var(--acs-warning-500)] flex items-center justify-center text-white text-xl font-bold"
          >
            ⚔️
          </div>
          <div>
            <h3 class="text-xl font-bold text-[var(--acs-text-primary)]">
              Confirmation de participation
            </h3>
            <p class="text-[var(--acs-text-secondary)]">
              Voulez-vous vraiment rejoindre ce tournoi ?
            </p>
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <div
          class="bg-[var(--acs-warning-50)] dark:bg-[var(--acs-warning-950)] border border-[var(--acs-warning-200)] dark:border-[var(--acs-warning-800)] rounded-xl p-4"
        >
          <h4
            class="font-semibold text-[var(--acs-warning-800)] dark:text-[var(--acs-warning-200)] mb-2"
          >
            🏆 Tournoi Valorant Pro League
          </h4>
          <ul
            class="text-sm text-[var(--acs-warning-700)] dark:text-[var(--acs-warning-300)] space-y-1"
          >
            <li>• Date : 15 Octobre 2025</li>
            <li>• Prize Pool : 10,000€</li>
            <li>• Format : 5v5 BO3</li>
            <li>• Inscription : 50€</li>
          </ul>
        </div>

        <p class="text-[var(--acs-text-secondary)]">
          En confirmant, vous vous engagez à participer et à respecter les
          règles du tournoi. L'inscription sera définitive.
        </p>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <Button variant="outline" @click="showConfirmModal = false">
            Annuler
          </Button>
          <Button color="warning" @click="confirmAction">
            ⚔️ Confirmer ma participation
          </Button>
        </div>
      </template>
    </Modal>

    <!-- Toast Container -->
    <ToastContainer />
  </div>
</template>
