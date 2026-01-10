<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import useGamesStore from "@/stores/gamesStore.ts";
import type {AcsdleUser} from "@/types/models";
import {formatDate} from "@vueuse/core";
import confetti from "canvas-confetti";
import LoaderACS from "@/components/global/LoaderACS.vue";

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
    encryptedObj: { payload?: string; iv?: string; tag?: string } | null | undefined,
    pass: string
) {
  if (!encryptedObj || !encryptedObj.payload || !encryptedObj.iv || !encryptedObj.tag) {
    throw new Error("Encrypted object is missing payload/iv/tag");
  }

  const keyRaw = await deriveKey(pass);
  const key = await crypto.subtle.importKey("raw", keyRaw, "AES-GCM", false, ["decrypt"]);
  const iv = b64ToArrayBuffer(encryptedObj.iv);
  const payload = b64ToArrayBuffer(encryptedObj.payload);
  const tag = b64ToArrayBuffer(encryptedObj.tag);

  const ct = new Uint8Array(payload.byteLength + tag.byteLength);
  ct.set(new Uint8Array(payload), 0);
  ct.set(new Uint8Array(tag), payload.byteLength);

  try {
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, key, ct);
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
const gameWon = ref(false);
const gameOver = ref(false);
const timeRemaining = ref(0);
const isLoading = ref(false);

const filteredUsers = computed(() => {
  if (!searchInput.value) return [];
  return allUsers.value.filter(user =>
    user.username.toLowerCase().includes(searchInput.value.toLowerCase())
  ).slice(0, 5) ?? [];
});

const reversedGuesses = computed(() => [...guesses.value].reverse());

onMounted(async () => {
  await gamesStore.fetchAcsdleUsers();
  await gamesStore.fetchAcsdleDailyCryptedUser();
  await gamesStore.fetchAcsdleTodayHistory().then(() => {
    if (gamesStore.acsdle.todayGuesses.some(guess => guess.id === decryptedUser.value?.id)) {
      gameWon.value = true;
    } else if (gamesStore.acsdle.todayGuesses.length >= 20) {
      gameOver.value = true;
    }
  });
  await gamesStore.fetchAcsdleHistory();

  // Calculate time remaining until midnight
  const timer = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    timeRemaining.value = midnight.getTime() - now.getTime();
    requestAnimationFrame(timer)
  }
  timer();
});

watch(gameWon, (newVal) => {
  if (newVal) {
    const scalar = 1.5
    const acs = confetti.shapeFromText({ text: "⭐", scalar })
    const end = Date.now() + 3 * 1000 // 3 seconds
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"]
    const frame = () => {
      if (Date.now() > end) return
      confetti({
        particleCount: 2,
        angle: 60 + Math.sin(Date.now() * 0.005) * 10,
        spread: 50,
        origin: { x: 0, y: 1 },
        startVelocity: 120,
        disableForReducedMotion: true,
        shapes: [acs],
        scalar,
        colors
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
        colors
      });
      requestAnimationFrame(frame)
    }
    frame();
  }
})

watch(dailyCryptedUser, async (newVal) => {
  isLoading.value = true;
  try {
    if (!newVal) {
      console.log("No encrypted user data");
      return;
    }
    const pass = import.meta.env.VITE_ACSDLE_CRYPTO_KEY;
    decryptAcsdle(newVal, pass).then((decrypted) => {
      decryptedUser.value = decrypted;
    }).finally(() => isLoading.value = false)
  } catch (err) {
    console.error("Decrypt error:", err);
  }
});

function selectUser(user: AcsdleUser) {
  searchInput.value = "";

  gamesStore.addAcsdleTodayGuess(user);

  if (user.id === decryptedUser.value?.id) {
    gameWon.value = true;
  } else if (guesses.value.length >= 20) {
    gameOver.value = true;
  }
}

function getIndicatorClass(guessValue: any, targetValue: any, field: string): string {
  if (targetValue === null || targetValue === undefined) return "bg-gray-600";

  const guessStr = String(guessValue).toLowerCase().trim();
  const targetStr = String(targetValue).toLowerCase().trim();

  // Pour les champs texte (mostGamePlayed)
  if (field === "mostPlayedGames") {
    if (guessStr === targetStr) return "bg-green-500";
    if (guessStr.includes(targetStr)) return "bg-blue-500";
    return "bg-red-500";
  }

  // Pour les champs numériques (tournois, victoires, top25)
  const guessNum = Number(guessValue);
  const targetNum = Number(targetValue);

  if (isNaN(guessNum) || isNaN(targetNum)) return "bg-gray-600";

  if (guessNum === targetNum) return "bg-green-500";
  if (targetNum < guessNum) return "bg-yellow-500"; // Lower
  return "bg-orange-500"; // Higher
}

function getYearDisplayClass(guess: AcsdleUser): string {
  if (!decryptedUser.value) return "bg-gray-600";
  const guessYear = new Date(guess.createdAt).getFullYear();
  const guessMonth = new Date(guess.createdAt).getMonth();
  const targetYear = new Date(decryptedUser.value.createdAt).getFullYear();
  const targetMonth = new Date(decryptedUser.value.createdAt).getMonth();
  return getIndicatorClass(guessYear+guessMonth, targetYear+targetMonth, "createdAt");
}

const hints = computed(() => [
  {
    condition: () => guesses.value.length > 3,
    messageActive: decryptedUser.value?.createdAt ? `Arrivé en ${formatDate(new Date(decryptedUser.value?.createdAt), "MMMM YYYY")}` : "ERREUR",
    messageInactive: "Indice disponible au 4ème essai",
  },
  {
    condition: () => guesses.value.length > 6,
    messageActive: `Jeux les plus joués: ${decryptedUser.value?.mostPlayedGames.join(', ') || "N/A"}`,
    messageInactive: "Indice disponible au 7ème essai",
  },
  {
    condition: () => guesses.value.length > 9,
    messageActive: `Pseudo: ${decryptedUser.value?.username.charAt(0) || "N/A"}${decryptedUser.value?.username.slice(1).replace(/./g, "*")}`,
    messageInactive: "Indice disponible au 10ème essai",
  },
]);
</script>

<template>
  <div class="min-h-screen text-white">
    <LoaderACS v-if="isLoading" />

    <div v-else class="mx-auto w-full max-w-6xl space-y-6 px-4 pt-6 pb-32 sm:px-6 sm:pt-8 lg:px-10">
      <!-- Header -->
      <header class="space-y-2 text-center">
        <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl">ACSDLE</h1>
        <p class="text-sm text-gray-400 sm:text-base">Devinez le joueur du jour</p>
      </header>

      <!-- Win Screen -->
      <div v-if="gameWon && decryptedUser" class="rounded-2xl border-2 border-green-500/80 bg-green-900/40 p-6 text-center shadow-2xl sm:p-8">
        <h2 class="mb-3 text-3xl font-bold sm:text-4xl">🎉 Bravo! 🎉</h2>
        <p class="mb-5 text-base sm:text-xl">Vous avez trouvé le joueur en {{ guesses.length }} essai(s)!</p>
        <div class="mb-5 rounded-2xl bg-gray-900/40 p-5 text-left sm:p-6">
          <h3 class="mb-4 text-xl font-bold sm:text-2xl">Statistiques de {{ decryptedUser.username }}</h3>
          <ul class="space-y-2 text-sm sm:text-base">
            <li><strong>Tournois joués:</strong> {{ decryptedUser.tournamentsPlayed }}</li>
            <li><strong>Victoires:</strong> {{ decryptedUser.victories }}</li>
            <li><strong>Top 25%:</strong> {{ decryptedUser.top25Finishes }}</li>
            <li><strong>Jeux les plus joués:</strong> {{ decryptedUser.mostPlayedGames.join(', ') }}</li>
            <li><strong>Membre depuis:</strong> {{ new Date(decryptedUser.createdAt).toLocaleDateString() }}</li>
          </ul>
        </div>
        <p class="text-base sm:text-xl">Prochain joueur dans <b>{{ formatDate(new Date(timeRemaining), "HH:mm:ss") }}</b></p>
      </div>

      <!-- Loss Screen -->
      <div v-if="gameOver && !gameWon && decryptedUser" class="rounded-2xl border-2 border-red-500/80 bg-red-900/40 p-6 text-center shadow-2xl sm:p-8">
        <h2 class="mb-3 text-3xl font-bold sm:text-4xl">😔 Game Over!</h2>
        <p class="mb-5 text-base sm:text-xl">Le champion était: <strong>{{ decryptedUser.username }}</strong></p>
        <div class="mb-5 rounded-2xl bg-gray-900/40 p-5 text-left sm:p-6">
          <h3 class="mb-4 text-xl font-bold sm:text-2xl">Statistiques du champion</h3>
          <ul class="space-y-2 text-sm sm:text-base">
            <li><strong>Tournois joués:</strong> {{ decryptedUser.tournamentsPlayed }}</li>
            <li><strong>Victoires:</strong> {{ decryptedUser.victories }}</li>
            <li><strong>Top 25%:</strong> {{ decryptedUser.top25Finishes }}</li>
            <li><strong>Jeu le plus joué:</strong> {{ decryptedUser.mostPlayedGames.join(', ') }}</li>
            <li><strong>Membre depuis:</strong> {{ new Date(decryptedUser.createdAt).toLocaleDateString() }}</li>
          </ul>
        </div>
      </div>

      <!-- Game Container -->
      <div v-if="decryptedUser" class="rounded-2xl bg-gray-800/70 p-4 shadow-2xl ring-1 ring-white/10 sm:p-6 lg:p-8">
        <!-- Search + stats -->
        <div class="mb-6 space-y-5">
          <div class="flex gap-2">
            <div class="relative flex-1">
              <input
                v-model="searchInput"
                type="text"
                placeholder="Tapez le nom d'un joueur..."
                class="w-full rounded-xl border-2 border-cyan-500 bg-gray-700/70 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="gameWon || gameOver"
              />
              <!-- Dropdown de suggestions -->
              <div v-if="filteredUsers.length > 0" class="absolute top-full left-0 right-0 mt-2 overflow-hidden rounded-xl border border-cyan-500/60 bg-gray-800/95 shadow-lg z-10">
                <button
                  v-for="user in filteredUsers"
                  :key="user.id"
                  @click="selectUser(user)"
                  class="w-full text-left px-4 py-3 hover:bg-cyan-500 hover:text-gray-900 transition"
                >
                  {{ user.username }}
                </button>
              </div>
            </div>
            <button
              v-if="filteredUsers.length > 0"
              class="rounded-xl bg-yellow-500 px-5 py-3 font-bold text-gray-900 transition hover:bg-yellow-600"
              @click="selectUser(filteredUsers[0]!)"
              aria-label="Valider la suggestion"
            >
              ▶
            </button>
          </div>

          <!-- Hints: 1 colonne sur mobile, 3 colonnes dès sm -->
          <div class="grid gap-3 sm:grid-cols-3">
            <div v-for="hint in hints" class="rounded-xl bg-surface-600/70 p-4 ring-1 ring-white/10">
              <p class="text-center text-sm sm:text-base">{{ hint.condition() ? hint.messageActive : hint.messageInactive }}</p>
            </div>
          </div>

          <div class="rounded-xl bg-gray-900/30 px-4 py-3 text-center">
            <p class="text-sm text-gray-300">Vous avez utilisé <span class="font-semibold text-white">{{ guesses.length }}</span> / 20 essais.</p>
          </div>
        </div>

        <!-- Table: scroll horizontal + layout plus compact sur mobile -->
        <div class="space-y-3">
          <div class="grid grid-cols-7 gap-2 items-center text-[11px] font-bold text-gray-300">
            <div class="text-center">Joueur</div>
            <div class="text-center">Tour.</div>
            <div class="text-center">Vic.</div>
            <div class="text-center">Top</div>
            <div class="text-center col-span-2">Jeux</div>
            <div class="text-center">M/A</div>
          </div>

          <div v-if="guesses.length > 0" class="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            <div class="min-w-[720px] space-y-2">
              <div v-for="(guess, index) in reversedGuesses" :key="index" class="grid grid-cols-7 gap-2 items-center rounded-2xl bg-gray-900/25 p-3 ring-1 ring-white/10">
                <div class="truncate rounded-xl bg-gray-700/70 p-3 text-center text-sm font-semibold">
                  {{ guess.username }}
                </div>

                <div :class="['rounded-xl', 'p-3', 'text-center', 'font-bold', getIndicatorClass(guess.tournamentsPlayed, decryptedUser?.tournamentsPlayed, 'tournamentsPlayed')]">
                  {{ guess.tournamentsPlayed }}
                </div>

                <div :class="['rounded-xl', 'p-3', 'text-center', 'font-bold', getIndicatorClass(guess.victories, decryptedUser?.victories, 'victories')]">
                  {{ guess.victories }}
                </div>

                <div :class="['rounded-xl', 'p-3', 'text-center', 'font-bold', getIndicatorClass(guess.top25Finishes, decryptedUser?.top25Finishes, 'top25Finishes')]">
                  {{ guess.top25Finishes }}
                </div>

                <div :class="['rounded-xl', 'p-3', 'text-center', 'font-bold', 'text-sm', 'col-span-2', getIndicatorClass(guess.mostPlayedGames, decryptedUser?.mostPlayedGames, 'mostPlayedGames')]">
                  {{ guess.mostPlayedGames.join(', ') || 'N/A' }}
                </div>

                <div :class="['rounded-xl', 'p-3', 'text-center', 'font-bold', 'text-sm', 'capitalize', getYearDisplayClass(guess)]">
                  {{ formatDate(new Date(guess.createdAt), 'MMMM / YYYY') }}
                </div>
              </div>
            </div>
          </div>

          <!-- Légende -->
          <div class="rounded-2xl bg-gray-700/60 p-5 ring-1 ring-white/10">
            <h3 class="mb-4 text-center font-bold">Indicateurs de couleur</h3>
            <div class="grid grid-cols-2 gap-4 text-sm md:grid-cols-5">
              <div class="flex items-center gap-2">
                <div class="h-6 w-6 rounded bg-green-500" />
                <span>Correct</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-6 w-6 rounded bg-red-500" />
                <span>Incorrect</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-6 w-6 rounded bg-blue-500" />
                <span>Partiellement</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-6 w-6 rounded bg-yellow-500" />
                <span>Inférieur</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-6 w-6 rounded bg-orange-500" />
                <span>Supérieur</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

