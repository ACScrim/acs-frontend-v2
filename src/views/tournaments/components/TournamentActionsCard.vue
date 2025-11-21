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
  <Card class="p-6 bg-christmas-navy/50 space-y-4" style="border: 2px solid #D4AF37;">
    <template #header>
      <h2 class="text-xl font-bold text-christmas-gold">Actions</h2>
    </template>

    <Button 
      class="w-full"
      @click="emit('unregister')"
      color="christmas-red"
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
        :color="!canRegister() ? 'christmas-red' : 'christmas-gold'"
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
        color="christmas-green"
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
      @click="emit('checkOut')"
      color="christmas-red"
      v-else-if="tournament.reminderSent && hasCheckedIn && isRegistered"
    >
      Check-out
    </Button>

    <Button v-if="tournament.finished" class="w-full mt-3" color="christmas-green">
      <template #icon>
        <VueIcon name="bs:check2-circle" class="text-xl" />
      </template>
      Tournoi terminé
    </Button>
  </Card>
</template>