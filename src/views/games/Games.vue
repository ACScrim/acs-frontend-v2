<script setup lang="ts">
import ListView from "@/components/global/ListView.vue";
import { Card } from "@/components/ui";

interface Game {
  id: string;
  name: string;
  description: string;
  route: string;
  icon: string;
  category: "Quiz" | "Puzzle" | "Collection" | "Créatif";
  gradient: string;
  players?: string;
}

const games: Game[] = [
  {
    id: "1",
    name: "Daily Quiz",
    description: "Testez vos connaissances avec le quiz quotidien.",
    route: "/games/dailyquiz",
    icon: "🧠",
    category: "Quiz",
    gradient: "from-blue-500/20 to-purple-500/20",
    players: "Solo",
  },
  {
    id: "2",
    name: "Acsdle",
    description:
      "Un jeu de devinettes inspiré de Loldle, mais sur les joueurs ACS.",
    route: "/games/acsdle",
    icon: "🎯",
    category: "Puzzle",
    gradient: "from-green-500/20 to-emerald-500/20",
    players: "Solo",
  },
  {
    id: "3",
    name: "Créateur de Cartes",
    description:
      "Créez vos propres cartes personnalisées avec des designs uniques.",
    route: "/games/card-creator",
    icon: "✨",
    category: "Créatif",
    gradient: "from-pink-500/20 to-rose-500/20",
    players: "Solo",
  },
  {
    id: "4",
    name: "Collection de Cartes",
    description: "Consultez et gérez votre collection de cartes.",
    route: "/games/card-collection",
    icon: "📚",
    category: "Collection",
    gradient: "from-amber-500/20 to-orange-500/20",
    players: "Solo",
  },
  {
    id: "5",
    name: "Boutique de Boosters",
    description:
      "Achetez des boosters pour enrichir votre collection de cartes.",
    route: "/games/booster-shop",
    icon: "🛍️",
    category: "Collection",
    gradient: "from-indigo-500/20 to-blue-500/20",
    players: "Solo",
  },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Quiz":
      return "bg-blue-500/20 text-blue-300";
    case "Puzzle":
      return "bg-green-500/20 text-green-300";
    case "Collection":
      return "bg-amber-500/20 text-amber-300";
    case "Créatif":
      return "bg-pink-500/20 text-pink-300";
    default:
      return "bg-gray-500/20 text-gray-300";
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Games List -->
    <ListView
      :data="games"
      :to="(game) => game.route"
      :max-cols="3"
      empty-message="Aucun jeu disponible pour le moment."
    >
      <template #emptyIcon>
        <div class="text-6xl mb-4">🎮</div>
      </template>

      <template #item="{ item: game }">
        <Card
          class="group overflow-hidden border-white/10 transition hover:-translate-y-1 hover:shadow-[0_35px_80px_rgba(0,0,0,0.45)]"
        >
          <div class="flex h-full flex-col">
            <!-- Game Header with Icon -->
            <div
              class="relative h-48 overflow-hidden bg-gradient-to-br"
              :class="game.gradient"
            >
              <div
                class="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent"
              />

              <!-- Large Icon in center -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div
                  class="text-8xl transform group-hover:scale-110 transition-transform duration-300 opacity-80"
                >
                  {{ game.icon }}
                </div>
              </div>

              <!-- Category Badge -->
              <div class="absolute top-4 right-4">
                <span
                  class="px-3 py-1 rounded-full text-xs font-medium border border-white/20 backdrop-blur-sm"
                  :class="getCategoryColor(game.category)"
                >
                  {{ game.category }}
                </span>
              </div>
            </div>

            <!-- Content Section -->
            <div
              class="flex flex-1 flex-col justify-between gap-5 bg-gradient-to-b from-surface-700/50 to-surface-800/40 p-6"
            >
              <div class="space-y-4">
                <!-- Game Title -->
                <div class="flex items-start justify-between gap-3">
                  <h2
                    class="text-xl font-semibold text-white line-clamp-2 font-display flex-1"
                    :title="game.name"
                  >
                    {{ game.name }}
                  </h2>
                </div>

                <!-- Game Description -->
                <p class="text-sm text-foam-200/80 line-clamp-3">
                  {{ game.description }}
                </p>

                <!-- Game Info -->
                <div class="space-y-3 text-sm text-foam-200/80">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span>👤</span>
                      <span>Mode</span>
                    </div>
                    <span
                      class="px-2 py-1 rounded text-xs bg-white/10 text-white"
                      >{{ game.players }}</span
                    >
                  </div>
                </div>
              </div>

              <!-- Play Button -->
              <div
                class="w-full bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-center text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-white/10 group-hover:border-white/50 cursor-pointer"
              >
                <span class="flex items-center justify-center gap-2">
                  <span>🎮</span>
                  <span>Jouer maintenant</span>
                  <span
                    class="transform group-hover:translate-x-1 transition-transform duration-300"
                    >→</span
                  >
                </span>
              </div>
            </div>
          </div>
        </Card>
      </template>
    </ListView>
  </div>
</template>
