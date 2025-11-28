<script setup lang="ts">
import { Button, Card } from '@/components/ui';
import type { Tournament } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';

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
</script>

<template>
  <Card class="glass-panel space-y-4 p-6">
    <template #header>
      <h2 class="text-xl font-semibold text-white">Actions</h2>
    </template>

    <Button 
      class="w-full"
      @click="emit('unregister')"
      variant="danger"
      v-if="props.isRegistered"
    >
      <template #icon>
        <VueIcon
          name="gl:leave"
          class="text-xl"
        />
      </template>
      Me désinscrire
    </Button>
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

    <Button
      class="w-full"
      @click="emit('checkIn')"
      v-if="tournament.reminderSent && !hasCheckedIn && isRegistered"
    >
      Check-in
    </Button>
    <Button
      class="w-full"
      variant="danger"
      @click="emit('checkOut')"
      v-else-if="tournament.reminderSent && hasCheckedIn && isRegistered"
    >
      Check-out
    </Button>

    <Button v-if="tournament.finished" class="w-full mt-3" variant="secondary">
      <template #icon>
        <VueIcon name="bs:check2-circle" class="text-xl" />
      </template>
      Tournoi terminé
    </Button>
  </Card>
</template>