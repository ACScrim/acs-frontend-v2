<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import useGamesStore from "@/stores/gamesStore.ts";
import type { AcsdleUser } from "@/types/models";
import { formatDate } from "@vueuse/core";
import confetti from "canvas-confetti";
import LoaderACS from "@/components/global/LoaderACS.vue";
import {useUserStore} from "@/stores/userStore.ts";

// Encryption/Decryption functions
function normalizeBase64(b64: string) {
  if (!b64) return "";
  b64 = b64.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4 !== 0) b64 += "=";
  return b64;
}

function b64ToArrayBuffer(b64: string) {
  const norm = normalizeBase64(b64);
  try {
    const bin = atob(norm);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  } catch (err) {
    throw new Error("Invalid base64 string provided to b64ToArrayBuffer");
  }
}

async function deriveKey(pass: string) {
  const enc = new TextEncoder();
  return await crypto.subtle.digest("SHA-256", enc.encode(pass));
}

async function decryptAcsdle(
  encryptedObj:
    | { payload?: string; iv?: string; tag?: string }
    | null
    | undefined,
  pass: string
) {
  if (
    !encryptedObj ||
    !encryptedObj.payload ||
    !encryptedObj.iv ||
    !encryptedObj.tag
  ) {
    throw new Error("Encrypted object is missing payload/iv/tag");
  }

  const keyRaw = await deriveKey(pass);
  const key = await crypto.subtle.importKey("raw", keyRaw, "AES-GCM", false, [
    "decrypt",
  ]);
  const iv = b64ToArrayBuffer(encryptedObj.iv);
  const payload = b64ToArrayBuffer(encryptedObj.payload);
  const tag = b64ToArrayBuffer(encryptedObj.tag);

  const ct = new Uint8Array(payload.byteLength + tag.byteLength);
  ct.set(new Uint8Array(payload), 0);
  ct.set(new Uint8Array(tag), payload.byteLength);

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      key,
      ct
    );
    return JSON.parse(new TextDecoder().decode(decrypted)) as AcsdleUser;
  } catch (err) {
    throw new Error("Decryption failed: " + (err as Error).message);
  }
}

// Game states
const gamesStore = useGamesStore();
const dailyCryptedUser = computed(() => gamesStore.acsdle.dailyCryptedUser);
const allUsers = computed(() => gamesStore.acsdle.users);
const guesses = computed(() => gamesStore.acsdle.todayGuesses);
const decryptedUser = ref<AcsdleUser | null>(null);
const searchInput = ref("");
const selectedSuggestionIndex = ref(-1);
const gameWon = ref(false);
const timeRemaining = ref(0);
const isLoading = ref(false);
const showTooltip = ref(false);

const filteredUsers = computed(() => {
  if (!searchInput.value) return [];
  return (
    allUsers.value
      .filter((user) =>
        user.username.toLowerCase().includes(searchInput.value.toLowerCase())
      )
      .slice(0, 5) ?? []
  );
});

const highlightMatch = (text: string, search: string) => {
  if (!search) return text;
  const regex = new RegExp(`(${search})`, "gi");
  return text.replace(
    regex,
    '<mark class="bg-yellow-400 text-gray-900 rounded px-1">$1</mark>'
  );
};

const reversedGuesses = computed(() => [...guesses.value].reverse());

onMounted(async () => {
  await gamesStore.fetchAcsdleUsers();
  await gamesStore.fetchAcsdleDailyCryptedUser();
  await gamesStore.fetchAcsdleTodayHistory().then(() => {
    if (
      gamesStore.acsdle.todayGuesses.some(
        (guess) => guess.id === decryptedUser.value?.id
      )
    ) {
      gameWon.value = true;
    }
  });
  await gamesStore.fetchAcsdleHistory();

  // Calculate time remaining until midnight
  const timer = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    timeRemaining.value = midnight.getTime() - now.getTime();
    requestAnimationFrame(timer);
  };
  timer();
});

watch(gameWon, (newVal) => {
  if (newVal) {
    const scalar = 1.5;
    const acs = confetti.shapeFromText({ text: "⭐", scalar });
    const end = Date.now() + 3 * 1000; // 3 seconds
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];
    const frame = () => {
      if (Date.now() > end) return;
      confetti({
        particleCount: 2,
        angle: 60 + Math.sin(Date.now() * 0.005) * 10,
        spread: 50,
        origin: { x: 0, y: 1 },
        startVelocity: 120,
        disableForReducedMotion: true,
        shapes: [acs],
        scalar,
        colors,
      });

      confetti({
        particleCount: 2,
        angle: 120 + Math.sin(Date.now() * 0.005) * 10,
        spread: 50,
        origin: { x: 1, y: 1 },
        startVelocity: 120,
        disableForReducedMotion: true,
        shapes: [acs],
        scalar,
        colors,
      });
      requestAnimationFrame(frame);
    };
    frame();
  }
});

watch(dailyCryptedUser, async (newVal) => {
  isLoading.value = true;
  try {
    if (!newVal) {
      console.log("No encrypted user data");
      return;
    }
    const pass = import.meta.env.VITE_ACSDLE_CRYPTO_KEY;
    decryptAcsdle(newVal, pass)
      .then((decrypted) => {
        decryptedUser.value = decrypted;
      })
      .finally(() => (isLoading.value = false));
  } catch (err) {
    console.error("Decrypt error:", err);
  }
});

function selectUser(user: AcsdleUser) {
  searchInput.value = "";
  selectedSuggestionIndex.value = -1;

  gamesStore.addAcsdleTodayGuess(user)
    .then(() => {
      if (user.id === decryptedUser.value?.id) {
        gameWon.value = true;
        useUserStore().fetchUser().then()
      }
    });
}

function handleKeyNavigation(event: KeyboardEvent) {
  if (gameWon.value) return;

  const suggestions = filteredUsers.value;
  if (!suggestions.length) return;

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      selectedSuggestionIndex.value = Math.min(
        selectedSuggestionIndex.value + 1,
        suggestions.length - 1
      );
      break;
    case "ArrowUp":
      event.preventDefault();
      selectedSuggestionIndex.value = Math.max(
        selectedSuggestionIndex.value - 1,
        -1
      );
      break;
    case "Enter":
      event.preventDefault();
      if (
        selectedSuggestionIndex.value >= 0 &&
        selectedSuggestionIndex.value < suggestions.length
      ) {
        const selectedUser = suggestions[selectedSuggestionIndex.value];
        if (selectedUser) {
          selectUser(selectedUser);
        }
      } else if (suggestions.length > 0) {
        const firstUser = suggestions[0];
        if (firstUser) {
          selectUser(firstUser);
        }
      }
      break;
    case "Escape":
      searchInput.value = "";
      selectedSuggestionIndex.value = -1;
      break;
  }
}

function resetSuggestionIndex() {
  selectedSuggestionIndex.value = -1;
}

function getIndicatorClass(
  guessValue: any,
  targetValue: any,
  field: string
): string {
  if (targetValue === null || targetValue === undefined) return "bg-gray-600";

  if (field === "firstTournament") {
    const guessObj = guessValue as { name: string, date: Date } | null | undefined;
    const targetObj = targetValue as { name: string, date: Date } | null | undefined;
    if (!guessObj || !targetObj) return "bg-gray-600";
    const guessDate = new Date(guessObj.date);
    const targetDate = new Date(targetObj.date);

    if (guessObj.name === targetObj.name) return "bg-green-500 animate-pulse";
    if (guessDate > targetDate) return "bg-yellow-500"; // Earlier
    return "bg-orange-500"; // Later
  }

  const guessStr = String(guessValue).toLowerCase().trim();
  const targetStr = String(targetValue).toLowerCase().trim();

  // Pour les champs texte (mostGamePlayed)
  if (field === "mostPlayedGames") {
    if (guessStr === targetStr) return "bg-green-500 animate-pulse";
    if (guessStr.includes(targetStr)) return "bg-blue-500";
    return "bg-red-500";
  }

  // Pour les champs numériques (tournois, victoires, top25)
  const guessNum = Number(guessValue);
  const targetNum = Number(targetValue);

  if (isNaN(guessNum) || isNaN(targetNum)) return "bg-gray-600";

  if (guessNum === targetNum) return "bg-green-500 animate-pulse";
  if (targetNum < guessNum) return "bg-yellow-500"; // Lower
  return "bg-orange-500"; // Higher
}

function getIndicatorIcon(
  guessValue: any,
  targetValue: any,
  field: string
): string {
  if (targetValue === null || targetValue === undefined) return "❓";

  if (field === "firstTournament") {
    const guessObj = guessValue as { name: string, date: Date } | null | undefined;
    const targetObj = targetValue as { name: string, date: Date } | null | undefined;
    if (!guessObj || !targetObj) return "bg-gray-600";
    const guessDate = new Date(guessObj.date);
    const targetDate = new Date(targetObj.date);

    if (guessObj.name === targetObj.name) return "✅";
    if (guessDate > targetDate) return "🔽"; // Earlier
    return "🔼"; // Later
  }

  const guessStr = String(guessValue).toLowerCase().trim();
  const targetStr = String(targetValue).toLowerCase().trim();

  if (field === "mostPlayedGames" || field === "firstTournament") {
    if (guessStr === targetStr) return "✅";
    if (guessStr.includes(targetStr)) return "🟦";
    return "❌";
  }

  const guessNum = Number(guessValue);
  const targetNum = Number(targetValue);

  if (isNaN(guessNum) || isNaN(targetNum)) return "❓";

  if (guessNum === targetNum) return "✅";
  if (targetNum < guessNum) return "🔽";
  return "🔼";
}

const hints = computed(() => [
  {
    condition: () => guesses.value.length > 3,
    messageActive: decryptedUser.value?.firstTournament
      ? `Premier ACS : ${decryptedUser.value?.firstTournament.name}`
      : "ERREUR",
    messageInactive: "Indice disponible au 4ème essai",
  },
  {
    condition: () => guesses.value.length > 6,
    messageActive: `Jeux les plus joués: ${
      decryptedUser.value?.mostPlayedGames.join(", ") || "N/A"
    }`,
    messageInactive: "Indice disponible au 7ème essai",
  },
  {
    condition: () => guesses.value.length > 9,
    messageActive: `Pseudo: ${
      decryptedUser.value?.username.charAt(0) || "N/A"
    }${decryptedUser.value?.username.slice(1).replace(/./g, "*")}`,
    messageInactive: "Indice disponible au 10ème essai",
  },
]);
</script>

<template>
  <div class="min-h-screen text-white">
    <LoaderACS v-if="isLoading" />

    <div
      v-else
      class="mx-auto w-full max-w-6xl space-y-6 px-4 pt-6 pb-32 sm:px-6 sm:pt-8 lg:px-10"
    >
      <!-- Header -->
      <div class="text-center space-y-3 mb-8">
        <h1
          class="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-azure-400 to-accent-400 bg-clip-text text-transparent"
        >
          ACSDLE
        </h1>
        <p class="text-foam-300 text-lg">
          Devinez le joueur du jour en analysant ses statistiques
        </p>
      </div>

      <!-- Win Screen -->
      <div
        v-if="gameWon && decryptedUser"
        class="rounded-2xl border-2 border-green-500/80 bg-green-900/40 p-6 text-center shadow-2xl sm:p-8"
      >
        <h2 class="mb-3 text-3xl font-bold sm:text-4xl">🎉 Bravo! 🎉</h2>
        <p class="mb-5 text-base sm:text-xl">
          Vous avez trouvé le joueur en {{ guesses.length }} essai(s)!
        </p>
        <div class="mb-5 rounded-2xl bg-gray-900/40 p-5 text-left sm:p-6">
          <h3 class="mb-4 text-xl font-bold sm:text-2xl">
            Statistiques de {{ decryptedUser.username }}
          </h3>
          <ul class="space-y-2 text-sm sm:text-base">
            <li>
              <strong>Tournois joués:</strong>
              {{ decryptedUser.tournamentsPlayed }}
            </li>
            <li><strong>Victoires:</strong> {{ decryptedUser.victories }}</li>
            <li><strong>Podium:</strong> {{ decryptedUser.podiumCount }}</li>
            <li>
              <strong>Jeux les plus joués:</strong>
              {{ decryptedUser.mostPlayedGames.join(", ") }}
            </li>
            <li>
              <strong>Premier ACS:</strong>
              {{ decryptedUser.firstTournament.name }}
            </li>
          </ul>
        </div>
        <p class="text-base sm:text-xl">
          Prochain joueur dans
          <b>{{ formatDate(new Date(timeRemaining), "HH:mm:ss") }}</b>
        </p>
      </div>

      <!-- Game Container -->
      <div
        v-if="decryptedUser"
        class="rounded-2xl bg-gray-800/70 p-4 shadow-2xl ring-1 ring-white/10 sm:p-6 lg:p-8"
      >
        <!-- Search + stats -->
        <div class="mb-6 space-y-5">
          <div class="flex gap-2">
            <div class="relative flex-1">
              <input
                v-model="searchInput"
                @input="resetSuggestionIndex"
                @keydown="handleKeyNavigation"
                type="text"
                placeholder="🔍 Tapez le nom d'un joueur..."
                class="w-full rounded-xl border-2 border-cyan-500/50 bg-gray-700/70 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
                :disabled="gameWon"
              />
              <!-- Dropdown de suggestions amélioré -->
              <div
                v-if="filteredUsers.length > 0"
                class="absolute top-full left-0 right-0 mt-2 overflow-hidden rounded-xl border border-cyan-500/60 bg-gray-800/95 shadow-xl backdrop-blur-sm z-10 animate-in slide-in-from-top-2"
              >
                <button
                  v-for="(user, index) in filteredUsers"
                  :key="user.id"
                  @click="selectUser(user)"
                  @mouseover="selectedSuggestionIndex = index"
                  class="w-full text-left px-4 py-3 transition-all duration-200 flex items-center gap-3"
                  :class="{
                    'bg-cyan-500 text-gray-900':
                      selectedSuggestionIndex === index,
                    'hover:bg-cyan-500/20': selectedSuggestionIndex !== index,
                  }"
                >
                  <div
                    class="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs font-bold"
                  >
                    {{ user.username.charAt(0).toUpperCase() }}
                  </div>
                  <span
                    v-html="highlightMatch(user.username, searchInput)"
                  ></span>
                  <div class="ml-auto text-xs opacity-60">
                    {{ user.tournamentsPlayed }} tournois
                  </div>
                </button>
              </div>
            </div>
            <button
              v-if="filteredUsers.length > 0"
              class="rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-5 py-3 font-bold text-gray-900 transition hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 active:scale-95"
              @click="
                selectUser(
                  filteredUsers[
                    selectedSuggestionIndex >= 0 ? selectedSuggestionIndex : 0
                  ]!
                )
              "
              aria-label="Valider la suggestion"
            >
              ▶
            </button>
          </div>

          <!-- Hints améliorés -->
          <div class="grid gap-3 sm:grid-cols-3">
            <div
              v-for="(hint, index) in hints"
              :key="index"
              class="rounded-xl border transition-all duration-300 p-4"
              :class="{
                'bg-emerald-500/10 border-emerald-500/30': hint.condition(),
                'bg-surface-600/70 border-white/10': !hint.condition(),
              }"
            >
              <div class="flex items-center gap-2 mb-2">
                <span class="text-lg">{{ ["📅", "🎮", "👤"][index] }}</span>
                <span class="text-xs font-bold uppercase tracking-wider">
                  {{ hint.condition() ? "Débloqué" : "Verrouillé" }}
                </span>
                <span v-if="hint.condition()" class="ml-auto text-green-400"
                  >✨</span
                >
              </div>
              <p
                class="text-sm"
                :class="hint.condition() ? 'text-emerald-200' : 'text-gray-400'"
              >
                {{
                  hint.condition() ? hint.messageActive : hint.messageInactive
                }}
              </p>
            </div>
          </div>

          <div class="rounded-xl bg-gray-900/30 px-4 py-3 text-center">
            <p class="text-sm text-gray-300">
              Vous avez utilisé
              <span class="font-semibold text-white">{{ guesses.length }}</span>
              essais.
            </p>
          </div>
        </div>

        <!-- Table: scroll horizontal + layout plus compact sur mobile -->
        <div class="space-y-3">
          <div
            class="grid grid-cols-8 gap-2 items-center text-[11px] font-bold text-gray-300"
          >
            <div class="text-center">Joueur</div>
            <div class="text-center">Tournois</div>
            <div class="text-center">Victoires</div>
            <div class="text-center">Podium</div>
            <div class="text-center col-span-2">Jeux</div>
            <div class="text-center col-span-2">Premier ACS</div>
          </div>

          <div
            v-if="guesses.length > 0"
            class="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
          >
            <div class="min-w-[720px] space-y-2">
              <div
                v-for="(guess, index) in reversedGuesses"
                :key="index"
                class="grid grid-cols-8 gap-2 items-center rounded-2xl bg-gray-900/25 p-3 ring-1 ring-white/10 hover:bg-gray-900/40 transition-all duration-300 animate-in slide-in-from-bottom-2"
                :style="{ animationDelay: `${index * 100}ms` }"
              >
                <div
                  class="truncate rounded-xl bg-gray-700/70 p-3 text-center text-sm font-semibold hover:bg-gray-600/70 transition-colors duration-200"
                >
                  {{ guess.username }}
                </div>

                <div
                  :class="[
                    'rounded-xl',
                    'p-3',
                    'text-center',
                    'font-bold',
                    'relative',
                    'group',
                    'transition-all',
                    'duration-300',
                    'hover:scale-105',
                    getIndicatorClass(
                      guess.tournamentsPlayed,
                      decryptedUser?.tournamentsPlayed,
                      'tournamentsPlayed'
                    ),
                  ]"
                >
                  <span class="absolute -top-1 -right-1 text-xs opacity-75">{{
                    getIndicatorIcon(
                      guess.tournamentsPlayed,
                      decryptedUser?.tournamentsPlayed,
                      "tournamentsPlayed"
                    )
                  }}</span>
                  {{ guess.tournamentsPlayed }}
                </div>

                <div
                  :class="[
                    'rounded-xl',
                    'p-3',
                    'text-center',
                    'font-bold',
                    'relative',
                    'group',
                    'transition-all',
                    'duration-300',
                    'hover:scale-105',
                    getIndicatorClass(
                      guess.victories,
                      decryptedUser?.victories,
                      'victories'
                    ),
                  ]"
                >
                  <span class="absolute -top-1 -right-1 text-xs opacity-75">{{
                    getIndicatorIcon(
                      guess.victories,
                      decryptedUser?.victories,
                      "victories"
                    )
                  }}</span>
                  {{ guess.victories }}
                </div>

                <div
                  :class="[
                    'rounded-xl',
                    'p-3',
                    'text-center',
                    'font-bold',
                    'relative',
                    'group',
                    'transition-all',
                    'duration-300',
                    'hover:scale-105',
                    getIndicatorClass(
                      guess.podiumCount,
                      decryptedUser?.podiumCount,
                      'podiumCount'
                    ),
                  ]"
                >
                  <span class="absolute -top-1 -right-1 text-xs opacity-75">{{
                    getIndicatorIcon(
                      guess.podiumCount,
                      decryptedUser?.podiumCount,
                      "podiumCount"
                    )
                  }}</span>
                  {{ guess.podiumCount }}
                </div>

                <div
                  :class="[
                    'rounded-xl',
                    'p-3',
                    'text-center',
                    'font-bold',
                    'text-sm',
                    'col-span-2',
                    'relative',
                    'group',
                    'transition-all',
                    'duration-300',
                    'hover:scale-105',
                    getIndicatorClass(
                      guess.mostPlayedGames,
                      decryptedUser?.mostPlayedGames,
                      'mostPlayedGames'
                    ),
                  ]"
                >
                  <span class="absolute -top-1 -right-1 text-xs opacity-75">{{
                    getIndicatorIcon(
                      guess.mostPlayedGames,
                      decryptedUser?.mostPlayedGames,
                      "mostPlayedGames"
                    )
                  }}</span>
                  {{ guess.mostPlayedGames.join(", ") || "N/A" }}
                </div>

                <div
                  :class="[
                    'rounded-xl',
                    'p-3',
                    'text-center',
                    'font-bold',
                    'text-sm',
                    'col-span-2',
                    'capitalize',
                    'relative',
                    'group',
                    'transition-all',
                    'duration-300',
                    'hover:scale-105',
                    getIndicatorClass(
                      guess.firstTournament,
                      decryptedUser?.firstTournament,
                      'firstTournament'
                    ),
                  ]"
                >
                  <span class="absolute -top-1 -right-1 text-xs opacity-75">{{
                      getIndicatorIcon(
                          guess.firstTournament,
                          decryptedUser.firstTournament,
                          "firstTournament"
                      )
                    }}</span>
                  {{ guess.firstTournament?.name }}
                </div>
              </div>
            </div>
          </div>

          <!-- Légende améliorée avec tooltips -->
          <div class="rounded-2xl bg-gray-700/60 p-5 ring-1 ring-white/10">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold flex items-center gap-2">
                <span>🎯</span>
                Indicateurs de couleur
              </h3>
              <button
                @click="showTooltip = !showTooltip"
                class="text-sm px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-all duration-200"
              >
                {{ showTooltip ? "Masquer" : "Aide" }}
              </button>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm md:grid-cols-5">
              <div
                class="flex items-center gap-2 group cursor-help"
                title="Valeur exacte"
              >
                <div
                  class="h-6 w-6 rounded bg-green-500 group-hover:scale-110 transition-transform"
                />
                >
                <span>✅ Correct</span>
              </div>
              <div
                class="flex items-center gap-2 group cursor-help"
                title="Valeur incorrecte"
              >
                <div
                  class="h-6 w-6 rounded bg-red-500 group-hover:scale-110 transition-transform"
                />
                <span>❌ Incorrect</span>
              </div>
              <div
                class="flex items-center gap-2 group cursor-help"
                title="Partiellement correct (jeux en commun)"
              >
                <div
                  class="h-6 w-6 rounded bg-blue-500 group-hover:scale-110 transition-transform"
                />
                <span>🟦 Partiel</span>
              </div>
              <div
                class="flex items-center gap-2 group cursor-help"
                title="Le vrai nombre est plus petit"
              >
                <div
                  class="h-6 w-6 rounded bg-yellow-500 group-hover:scale-110 transition-transform"
                />
                <span>🔽 Inférieur</span>
              </div>
              <div
                class="flex items-center gap-2 group cursor-help"
                title="Le vrai nombre est plus grand"
              >
                <div
                  class="h-6 w-6 rounded bg-orange-500 group-hover:scale-110 transition-transform"
                />
                <span>🔼 Supérieur</span>
              </div>
            </div>

            <div
              v-if="showTooltip"
              class="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg animate-in slide-in-from-top-1"
            >
              <h4 class="font-semibold text-cyan-300 mb-2">
                💡 Conseils de jeu :
              </h4>
              <ul class="text-sm space-y-1 text-cyan-100/80">
                <li>
                  • Utilisez les flèches ↑↓ pour naviguer dans les suggestions
                </li>
                <li>• Appuyez sur Entrée pour valider votre sélection</li>
                <li>
                  • Les icônes vous indiquent la direction (plus haut/plus bas)
                </li>
                <li>
                  • Les animations pulsantes indiquent une correspondance exacte
                </li>
                <li>• Débloquez des indices en jouant plus de coups</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
