<script setup lang="ts">
import { Button, Card } from '@/components/ui';
import type { Tournament } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed } from 'vue';
import { getGameColor } from '../composables/useGameColor';

interface Props {
  tournament: Tournament;
  currentPlayerCount: number;
  isRegistered: boolean;
  hasCheckedIn: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  register: [];
  registerAsCaster: [];
  unregister: [];
  checkIn: [];
  checkOut: [];
}>();

const canRegister = () => props.tournament.playerCap <= 0 || props.currentPlayerCount < props.tournament.playerCap;

const headerColor = computed((): string => {
  const gameId = props.tournament.gameId || 'default';
  return getGameColor(gameId);
});
</script>

<template>
  <Card class="glass-panel space-y-4 p-6">
    <template #header>
      <h2
        class="text-xl font-semibold text-white pl-4 -ml-4 py-1 border-l-4"
        :style="{ borderLeftColor: headerColor }"
      >
        Actions
      </h2>
    </template>

    <!-- Bouton Check-in: couleur vive et visible -->
    <Button
      class="w-full"
      variant="emerald"
      @click="emit('checkIn')"
      v-if="tournament.reminderSent && !hasCheckedIn && isRegistered"
    >
      <template #icon>
        <VueIcon name="bs:check2-circle" class="text-xl" />
      </template>
      Check-in
    </Button>

    <!-- Bouton Check-out: couleur neutre -->
    <Button
      class="w-full"
      variant="secondary"
      @click="emit('checkOut')"
      v-else-if="tournament.reminderSent && hasCheckedIn && isRegistered"
    >
      <template #icon>
        <VueIcon name="bs:check2-circle" class="text-xl" />
      </template>
      Check-out
    </Button>

    <!-- Bouton Me désinscrire: style discret (lien neutre) -->
    <button
        v-if="props.isRegistered"
        @click="emit('unregister')"
        class="w-full px-4 py-2 text-sm text-gray-400 hover:text-white hover:underline transition-colors bg-transparent"
    >
      <span class="flex items-center justify-center gap-2">
        <VueIcon name="gl:leave" class="text-lg" />
        Me désinscrire
      </span>
    </button>

    <!-- Boutons d'inscription -->
    <template v-else>
      <Button
        class="w-full"
        @click="emit('register')"
        :variant="!canRegister() ? 'outline' : 'primary'"
      >
        <template #icon>
          <VueIcon
            :name="!canRegister() ? 'bs:clock' : 'bs:controller'"
            class="text-xl"
          />
        </template>
        {{ !canRegister() ? "Rejoindre l'attente" : "M'inscrire" }}
      </Button>
      <Button
        class="w-full"
        @click="emit('registerAsCaster')"
        variant="secondary"
      >
        <template #icon>
          <VueIcon
              name="bs:mic"
              class="text-xl"
          />
        </template>
        Rejoindre le cast
      </Button>
    </template>

    <Button v-if="tournament.finished" class="w-full mt-3" variant="secondary">
      <template #icon>
        <VueIcon name="bs:check2-circle" class="text-xl" />
      </template>
      Tournoi terminé
    </Button>
  </Card>
</template>