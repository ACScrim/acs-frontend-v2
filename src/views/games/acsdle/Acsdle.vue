<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import useGamesStore from "@/stores/gamesStore.ts";
import type {AcsdleUser} from "@/types/models";
import {formatDate} from "@vueuse/core";
import confetti from "canvas-confetti";
import {Line} from 'vue-chartjs'
import {
  CategoryScale,
  Chart,
  type ChartData,
  type ChartOptions,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from "chart.js";

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
  try {
    if (!newVal) {
      console.log("No encrypted user data");
      return;
    }
    const pass = import.meta.env.VITE_ACSDLE_CRYPTO_KEY;
    decryptedUser.value = await decryptAcsdle(newVal, pass);
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
  if (field === "mostGamePlayed") {
    if (guessStr === targetStr) return "bg-green-500";
    return "bg-red-500";
  }

  // Pour la date d'arrivée
  if (field === "createdAt") {
    const guessYear = new Date(guessValue).getFullYear();
    const targetYear = new Date(targetValue).getFullYear();
    if (guessYear === targetYear) return "bg-green-500";
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
  const targetYear = new Date(decryptedUser.value.createdAt).getFullYear();
  return getIndicatorClass(guessYear, targetYear, "createdAt");
}

const hints = computed(() => [
  {
    condition: () => guesses.value.length > 3,
    messageActive: decryptedUser.value?.createdAt ? `Arrivé en ${formatDate(new Date(decryptedUser.value?.createdAt), "MMMM YYYY")}` : "ERREUR",
    messageInactive: "Indice disponible au 4ème essai",
  },
  {
    condition: () => guesses.value.length > 6,
    messageActive: `Jeu le plus joué: ${decryptedUser.value?.mostGamePlayed || "N/A"}`,
    messageInactive: "Indice disponible au 7ème essai",
  },
  {
    condition: () => guesses.value.length > 9,
    messageActive: `Pseudo: ${decryptedUser.value?.username.charAt(0) || "N/A"}${decryptedUser.value?.username.slice(1).replace(/./g, "*")}`,
    messageInactive: "Indice disponible au 10ème essai",
  },
]);

Chart.register(Tooltip, PointElement, LineElement, CategoryScale, LinearScale)

const chartData: ChartData<'line'> = {
  labels: gamesStore.acsdle.guessHistory.map((guess) => formatDate(new Date(guess.completedAt ?? ""), "DD/MM")),
  datasets: [ { data: gamesStore.acsdle.guessHistory.map(g => g.attempts.length), backgroundColor: '#f87979', label: "Essais", borderColor: "#ffffff", pointBorderColor: "#f87979" } ]
}
const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 2
      }
    }
  }
}
</script>

<template>
  <div class="min-h-screen text-white">
    <!-- Header -->
    <div class="max-w-6xl mx-auto space-y-8">
      <h1 class="text-5xl font-bold mb-2 text-center">ACSDLE</h1>
      <p class="text-center text-gray-400 mb-8">Devinez le joueur du jour</p>

      <!-- Win Screen -->
      <div v-if="gameWon && decryptedUser" class="rounded-lg border-2 border-green-500 bg-green-900 p-8 text-center shadow-2xl">
        <h2 class="mb-4 text-4xl font-bold">🎉 Bravo! 🎉</h2>
        <p class="mb-6 text-xl">Vous avez trouvé le joueur en {{ guesses.length }} essai(s)!</p>
        <div class="mb-6 rounded-lg bg-gray-800 p-6">
          <h3 class="mb-4 text-2xl font-bold">Statistiques de {{ decryptedUser.username }}</h3>
          <ul class="space-y-2 text-left">
            <li><strong>Tournois joués:</strong> {{ decryptedUser.tournamentsPlayed }}</li>
            <li><strong>Victoires:</strong> {{ decryptedUser.victories }}</li>
            <li><strong>Top 25%:</strong> {{ decryptedUser.top25Finishes }}</li>
            <li><strong>Jeu le plus joué:</strong> {{ decryptedUser.mostGamePlayed }}</li>
            <li><strong>Membre depuis:</strong> {{ new Date(decryptedUser.createdAt).toLocaleDateString() }}</li>
          </ul>
        </div>
        <p class="text-xl">Prochain joueur dans <b>{{ formatDate(new Date(timeRemaining), "HH:mm:ss")}}</b></p>
      </div>

      <div class="bg-gray-800 rounded-lg p-8 shadow-2xl">
        <Line
          id="my-chart-id"
          :options="chartOptions"
          :data="chartData"
        />
      </div>

      <!-- Loss Screen -->
      <div v-if="gameOver && !gameWon && decryptedUser" class="rounded-lg border-2 border-red-500 bg-red-900 p-8 text-center shadow-2xl">
        <h2 class="mb-4 text-4xl font-bold">😔 Game Over!</h2>
        <p class="mb-6 text-xl">Le champion était: <strong>{{ decryptedUser.username }}</strong></p>
        <div class="mb-6 rounded-lg bg-gray-800 p-6">
          <h3 class="mb-4 text-2xl font-bold">Statistiques du champion</h3>
          <ul class="space-y-2 text-left">
            <li><strong>Tournois joués:</strong> {{ decryptedUser.tournamentsPlayed }}</li>
            <li><strong>Victoires:</strong> {{ decryptedUser.victories }}</li>
            <li><strong>Top 25%:</strong> {{ decryptedUser.top25Finishes }}</li>
            <li><strong>Jeu le plus joué:</strong> {{ decryptedUser.mostGamePlayed }}</li>
            <li><strong>Membre depuis:</strong> {{ new Date(decryptedUser.createdAt).toLocaleDateString() }}</li>
          </ul>
        </div>
      </div>

      <!-- Game Container -->
      <div v-if="decryptedUser" class="bg-gray-800 rounded-lg p-8 shadow-2xl">
        <!-- Search Bar -->
        <div class="mb-8 relative space-y-5">
          <div class="flex gap-2">
            <div class="relative flex-1">
              <input
                v-model="searchInput"
                type="text"
                placeholder="Tapez le nom d'un joueur..."
                class="w-full bg-gray-700 border-2 border-cyan-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="gameWon || gameOver"
              />
              <!-- Dropdown de suggestions -->
              <div v-if="filteredUsers.length > 0" class="absolute top-full left-0 right-0 mt-2 bg-gray-700 rounded-lg border border-cyan-500 shadow-lg z-10">
                <button
                  v-for="user in filteredUsers"
                  :key="user.id"
                  @click="selectUser(user)"
                  class="w-full text-left px-4 py-2 hover:bg-cyan-500 hover:text-gray-900 transition"
                >
                  {{ user.username }}
                </button>
              </div>
            </div>
            <button
              v-if="filteredUsers.length > 0"
              class="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-6 py-3 rounded-lg transition"
              @click="selectUser(filteredUsers[0]!)"
            >
              ▶
            </button>
          </div>

          <div class="flex gap-2 justify-between">
            <div v-for="hint in hints" class="p-5 bg-surface-600 rounded-md basis-1/3">
              <p class="text-center">{{ hint.condition() ? hint.messageActive : hint.messageInactive }}</p>
            </div>
          </div>

          <div>
            <p class="text-sm text-gray-400 text-center">Vous avez utilisé {{ guesses.length }} / 20 essais.</p>
          </div>
        </div>

        <!-- Column Headers -->
        <div class="mb-4 grid grid-cols-7 gap-2 items-center">
          <div class="col-span-2 text-xs font-bold text-gray-300 text-center">Joueur</div>
          <div class="text-xs font-bold text-gray-300 text-center">Tournois</div>
          <div class="text-xs font-bold text-gray-300 text-center">Victoires</div>
          <div class="text-xs font-bold text-gray-300 text-center">Top 25%</div>
          <div class="text-xs font-bold text-gray-300 text-center">Jeu</div>
          <div class="text-xs font-bold text-gray-300 text-center">Mois / Année</div>
        </div>

        <!-- Guesses Table -->
        <div v-if="guesses.length > 0" class="overflow-x-auto mb-8">
          <div class="space-y-2">
            <div v-for="(guess, index) in reversedGuesses" :key="index" class="grid grid-cols-7 gap-2 items-center pb-4 border-b border-gray-700">
              <!-- Username -->
              <div class="col-span-2">
                <div class="bg-gray-700 p-3 rounded-lg text-sm font-semibold truncate">
                  {{ guess.username }}
                </div>
              </div>

              <!-- Nombre de tournois -->
              <div :class="['p-3', 'rounded-lg', 'text-center', 'font-bold', getIndicatorClass(guess.tournamentsPlayed, decryptedUser?.tournamentsPlayed, 'tournamentsPlayed')]">
                {{ guess.tournamentsPlayed }}
              </div>

              <!-- Nombre de victoires -->
              <div :class="['p-3', 'rounded-lg', 'text-center', 'font-bold', getIndicatorClass(guess.victories, decryptedUser?.victories, 'victories')]">
                {{ guess.victories }}
              </div>

              <!-- Top 25% -->
              <div :class="['p-3', 'rounded-lg', 'text-center', 'font-bold', getIndicatorClass(guess.top25Finishes, decryptedUser?.top25Finishes, 'top25Finishes')]">
                {{ guess.top25Finishes }}
              </div>

              <!-- Jeu le plus joué -->
              <div :class="['p-3', 'rounded-lg', 'text-center', 'font-bold', getIndicatorClass(guess.mostGamePlayed, decryptedUser?.mostGamePlayed, 'mostGamePlayed')]">
                {{ guess.mostGamePlayed || "N/A" }}
              </div>

              <!-- Date d'arrivée -->
              <div :class="['p-3', 'rounded-lg', 'text-center', 'font-bold', 'text-sm', getYearDisplayClass(guess)]">
                {{ formatDate(new Date(guess.createdAt), "MMMM / YYYY") }}
              </div>
            </div>
          </div>
        </div>

        <!-- Indicateurs de couleur -->
        <div class="bg-gray-700 p-6 rounded-lg">
          <h3 class="font-bold mb-4 text-center">Indicateurs de couleur</h3>
          <div class="grid grid-cols-2 gap-4 text-sm md:grid-cols-5">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded bg-green-500" />
              <span>Correct</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded bg-red-500" />
              <span>Incorrect</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded bg-yellow-500" />
              <span>Inférieur</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded bg-orange-500" />
              <span>Supérieur</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded bg-gray-600" />
              <span>Vide</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

