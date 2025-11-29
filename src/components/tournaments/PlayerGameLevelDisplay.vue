<script setup lang="ts">
import type { PlayerGameLevel } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed } from 'vue';
import { Button } from '@/components/ui';

interface Props {
  playerLevel: PlayerGameLevel;
}

const props = defineProps<Props>();

// Configuration des niveaux avec couleurs et icônes
const levelConfig = computed(() => {
  const configs: Record<string, { color: string; bgColor: string; icon: string; badge: string }> = {
    débutant: {
      color: 'text-green-400',
      bgColor: 'from-green-500/20 to-green-600/10',
      icon: 'bs:star',
      badge: 'Débutant'
    },
    intermédiaire: {
      color: 'text-blue-400',
      bgColor: 'from-blue-500/20 to-blue-600/10',
      icon: 'bs:stars',
      badge: 'Intermédiaire'
    },
    avancé: {
      color: 'text-purple-400',
      bgColor: 'from-purple-500/20 to-purple-600/10',
      icon: 'bs:fire',
      badge: 'Avancé'
    },
    expert: {
      color: 'text-yellow-400',
      bgColor: 'from-yellow-500/20 to-yellow-600/10',
      icon: 'bs:lightning-fill',
      badge: 'Expert'
    }
  };
  return configs[props.playerLevel.level.toLowerCase()] || null;
});

// Calcul du rang visuel pour les joueurs classés
const getRankBadge = computed(() => {
  if (!props.playerLevel.isRanked || !props.playerLevel.rank) return null;
  return {
    text: props.playerLevel.rank,
    icon: 'bs:trophy-fill'
  };
});
</script>

<template>
  <div class="space-y-4">
    <!-- Carte principale du niveau -->
    <div
      v-if="levelConfig"
      class="relative overflow-hidden rounded-lg border-2 p-6 bg-gradient-to-br transition-all duration-300 hover:scale-105 hover:shadow-lg"
      :class="`${levelConfig.bgColor} border-white/15 hover:border-accent-300/70`">
      <!-- Effet de fond animé -->
      <div class="absolute inset-0 opacity-30 pointer-events-none">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent-300/20 rounded-full blur-2xl"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blush-500/20 rounded-full blur-2xl"></div>
      </div>

      <!-- Contenu -->
      <div class="relative z-10 space-y-4">
        <!-- En-tête avec icône et badge -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div :class="[levelConfig.color, 'text-4xl']">
              <VueIcon :name="levelConfig.icon" />
            </div>
            <div
              class="px-3 py-1 rounded-full text-xs font-bold uppercase"
              :class="[levelConfig.color, 'bg-black/30 border border-current']"
            >
              {{ levelConfig.badge }}
            </div>
          </div>
        </div>

        <!-- Séparateur -->
        <div class="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

        <!-- Informations du joueur -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Pseudo du jeu -->
          <div class="space-y-1">
            <p class="text-xs text-foam-300/70 uppercase tracking-wider">
              <VueIcon name="bs:person-circle" class="inline mr-1" />
              Pseudo
            </p>
            <p class="text-lg font-bold text-foam-50">{{ playerLevel.gameUsername }}</p>
          </div>

          <!-- Rang si classé -->
          <div v-if="playerLevel.isRanked && getRankBadge" class="space-y-1">
            <p class="text-xs text-foam-300/70 uppercase tracking-wider">
              <VueIcon name="bs:trophy-fill" class="inline mr-1 text-yellow-400" />
              Rang
            </p>
            <p class="text-lg font-bold text-amber-300">{{ getRankBadge.text }}</p>
          </div>

          <!-- Rôles sélectionnés -->
          <div v-if="playerLevel.selectedRoles.length > 0" class="md:col-span-2 space-y-1">
            <p class="text-xs text-foam-300/70 uppercase tracking-wider">
              <VueIcon name="bs:suit-heart-fill" class="inline mr-1" />
              Rôles préférés
            </p>
            <div class="flex gap-2 flex-wrap">
              <span
                v-for="role in playerLevel.selectedRoles"
                :key="role"
                class="px-3 py-1 rounded-full text-sm font-bold bg-white/10 text-foam-50 border border-white/20"
              >
                {{ role }}
              </span>
            </div>
          </div>

          <!-- Commentaire -->
          <div v-if="playerLevel.comment" class="md:col-span-2 space-y-1">
            <p class="text-xs text-foam-300/70 uppercase tracking-wider">
              <VueIcon name="bs:chat-dots-fill" class="inline mr-1" />
              Commentaire
            </p>
            <p class="text-sm text-foam-200/80 italic">{{ playerLevel.comment }}</p>
          </div>

          <!-- Lien profil -->
          <div v-if="playerLevel.gameProfileLink" class="md:col-span-2 space-y-1">
            <p class="text-xs text-foam-300/70 uppercase tracking-wider">
              <VueIcon name="bs:link-45deg" class="inline mr-1" />
              Profil
            </p>
            <a
              :href="playerLevel.gameProfileLink"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-sm text-accent-200 hover:text-foam-50 transition-colors"
            >
              <VueIcon name="bs:box-arrow-up-right" class="text-xs" />
              Voir le profil
            </a>
          </div>
        </div>

        <!-- Badges additionnels -->
        <div class="flex gap-2 pt-2">
          <!-- Badge classé -->
          <div
            v-if="playerLevel.isRanked"
            class="px-2 py-1 rounded text-xs font-bold text-foam-50 bg-white/10 border border-white/20 flex items-center gap-1"
          >
            <VueIcon name="bs:shield-check" />
            Mode classé
          </div>

          <!-- Badge date -->
          <div class="px-2 py-1 rounded text-xs font-bold text-foam-300/80 bg-black/20 border border-white/15 flex items-center gap-1">
            <VueIcon name="bs:calendar-event" />
            {{ new Date(playerLevel.updatedAt).toLocaleDateString('fr-FR') }}
          </div>
        </div>
      </div>
    </div>
    <Button :to="`/player-levels`" class="w-full">
      Mettre à jour mon niveau
    </Button>
  </div>
</template>

<style scoped>
/* Animation douce au survol */
@keyframes floatUp {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

.hover\:animate-float:hover {
  animation: floatUp 2s ease-in-out infinite;
}
</style>
