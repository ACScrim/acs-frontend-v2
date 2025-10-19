<script setup lang="ts">
import { Button, Card } from '@/components/ui';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';

interface Props {
  playerCap: number;
  currentPlayerCount: number;
  isFinished: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  register: [];
}>();

const canRegister = () => props.playerCap <= 0 || props.currentPlayerCount < props.playerCap;
</script>

<template>
  <Card class="p-6 bg-christmas-navy/50" style="border: 2px solid #D4AF37;">
    <template #header>
      <h2 class="text-xl font-bold text-christmas-gold">Actions</h2>
    </template>

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

    <Button v-if="isFinished" class="w-full mt-3" color="christmas-green">
      <template #icon>
        <VueIcon name="bs:check2-circle" class="text-xl" />
      </template>
      Tournoi terminé
    </Button>
  </Card>
</template>