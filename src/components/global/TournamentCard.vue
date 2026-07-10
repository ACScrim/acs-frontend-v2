<script setup lang="ts">
import type { Tournament } from "@/types/models";
import { formatDate, useTimeAgoIntl } from "@vueuse/core";
import { Card, Button, Badge } from "../ui";
import VueIcon from "@kalimahapps/vue-icons/VueIcon";
import { computed } from "vue";

interface Props {
  tournament: Tournament;
}
const props = defineProps<Props>();

const tournamentDate = computed(() => new Date(props.tournament.date));
const dayLabel = computed(() =>
  formatDate(tournamentDate.value, "dddd", { locales: "fr" })
);
const dateLabel = computed(() =>
  formatDate(tournamentDate.value, "DD/MM/YYYY HH:mm")
);
const timeAgo = useTimeAgoIntl(tournamentDate, { locale: "fr" });

const registeredPlayerCount = computed(
  () => props.tournament.players.filter((player) => !player.inWaitlist && !player.isCaster).length
);
const nonCasterPlayerCount = computed(
  () => props.tournament.players.filter((player) => !player.isCaster).length
);
const playerPluralSuffix = computed(() =>
  props.tournament.players.length > 1 ? "s" : ""
);
const isCapacityFull = computed(
  () =>
    props.tournament.playerCap > 0 &&
    props.tournament.players.length >= props.tournament.playerCap
);
const isRegistrationFull = computed(
  () =>
    props.tournament.playerCap > 0 &&
    nonCasterPlayerCount.value >= props.tournament.playerCap
);
const playerProgress = computed(() =>
  props.tournament.playerCap > 0
    ? Math.round((registeredPlayerCount.value / props.tournament.playerCap) * 100)
    : 0
);
const winnerName = computed(
  () =>
    props.tournament.teams.find(
      (team) =>
        team.ranking === 1 ||
        (team.ranking === null && props.tournament.teams[0] === team)
    )?.name ??
    props.tournament.teams[0]?.name ??
    "À déterminer"
);
</script>

<template>
  <Card
    class="group overflow-hidden border-white/10 transition hover:-translate-y-1 hover:shadow-[0_35px_80px_rgba(0,0,0,0.45)]"
  >
    <div class="flex h-full flex-col">
      <div class="relative h-48 overflow-hidden">
        <img
          :src="tournament.game.imageUrl"
          :alt="tournament.game.name"
          class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent"
        />
        <div class="absolute top-4 right-4 flex flex-col items-end gap-3">
          <Badge
            tone="neutral"
            size="md"
            class="bg-black/60 backdrop-blur-sm border border-white/20"
            >{{ dayLabel }}</Badge
          >
          <Badge
            v-if="!tournament.finished"
            :tone="isCapacityFull ? 'blush' : 'emerald'"
            size="md"
            class="bg-black/60 backdrop-blur-sm border border-white/20 font-semibold"
          >
            {{ isCapacityFull ? "Complet" : "Ouvert" }}
          </Badge>
        </div>
      </div>

      <div
        class="flex flex-1 flex-col justify-between gap-5 bg-gradient-to-b from-surface-700/50 to-surface-800/40 p-6"
      >
        <div class="space-y-4">
          <div class="flex items-start justify-between gap-3">
            <h2
              class="text-xl font-semibold text-white line-clamp-2 font-display flex-1"
              :title="tournament.name"
            >
              {{ tournament.name }}
            </h2>
          </div>

          <div class="space-y-3 text-sm text-foam-200/80">
            <div class="flex items-center gap-2">
              <VueIcon name="ak:calendar" class="text-accent-300" />
              <span>{{ dateLabel }} · {{ timeAgo }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <VueIcon name="bx:game" class="text-amber-400" />
                <span>Jeu</span>
              </div>
              <Badge
                tone="neutral"
                size="sm"
                class="bg-black/50 backdrop-blur-sm border border-white/20"
                >{{ tournament.game.name }}</Badge
              >
            </div>
            <div class="flex items-center gap-2">
              <VueIcon name="cl:users" class="text-emerald-400" />
              <span>
                {{ registeredPlayerCount }}
                <template v-if="tournament.playerCap > 0"
                  >/ {{ tournament.playerCap }}</template
                >
                joueur{{ playerPluralSuffix }}
              </span>
            </div>
            <div
              v-if="tournament.playerCap > 0"
              class="rounded-full border border-white/10 bg-white/5 p-1"
            >
              <div
                class="h-2 rounded-full bg-gradient-to-r from-accent-500 via-blush-500 to-emerald-500"
                :style="{
                  width: `${playerProgress}%`,
                }"
              />
            </div>
          </div>
        </div>

        <Button
          v-if="!tournament.finished"
          class="w-full justify-between"
          icon-position="lr"
          :variant="isRegistrationFull ? 'outline' : 'primary'"
        >
          <template #icon>
            <VueIcon
              :name="isRegistrationFull ? 'bs:clock' : 'bs:controller'"
            />
          </template>
          <span class="text-left">
            {{
              isRegistrationFull
                ? "Rejoindre la liste d'attente"
                : "Je veux m'inscrire !"
            }}
          </span>
        </Button>
        <div
          v-else
          class="rounded-lg border-2 border-amber-400 bg-gradient-to-r from-amber-500/10 to-amber-400/10 p-4"
        >
          <div class="text-center">
            <p
              class="text-xs uppercase tracking-[0.3em] text-amber-300/70 mb-2"
            >
              Vainqueur
            </p>
            <p class="text-lg font-semibold text-amber-300">
              {{ winnerName }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>
