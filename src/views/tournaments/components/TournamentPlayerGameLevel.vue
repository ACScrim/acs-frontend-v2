<script setup lang="ts">
import { Button, Card } from '@/components/ui';
import PlayerGameLevelDisplay from '@/components/tournaments/PlayerGameLevelDisplay.vue';
import usePlayerLevelStore from '@/stores/playerLevelStore';
import useTournamentStore from '@/stores/tournamentStore';
import { useToastStore } from '@/stores/toastStore';
import type { Tournament } from '@/types/models';
import { ref } from 'vue';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';

const props = defineProps<{
  tournament: Tournament;
}>();

const playerLevelStore = usePlayerLevelStore();
const toastStore = useToastStore();

const showLevelForm = ref(false);
const isRanked = ref(false);
const gameProfileLink = ref('');
const profileLinkError = ref('');

const validateProfileLink = (gameProfileLink: string, gameProfileLinkRegex: string): boolean => {
  if (!gameProfileLinkRegex) return true;
  if (!gameProfileLink) return false;
  try {
    new URL(gameProfileLink);
    const regex = new RegExp(gameProfileLinkRegex);
    return regex.test(gameProfileLink);
  } catch {
    return false;
  }
};

const onProfileLinkChange = () => {
  profileLinkError.value = '';
  if (gameProfileLink.value && !validateProfileLink(gameProfileLink.value, props.tournament.game.gameProfileLinkRegex || '')) {
    profileLinkError.value = `Format regex: ${props.tournament.game.gameProfileLinkRegex}`;
  }
};

const onSubmitHandler = async (e: Event) => {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);
  const level = formData.get('level') as string;
  const selectedRoles = formData.getAll('role') as string[];
  const gameUsername = formData.get('gameUsername') as string;
  const isRankedValue = formData.get('isranked') === 'on';
  const rank = isRankedValue ? (formData.get('rank') as string) : undefined;
  const comment = formData.get('comment') as string | undefined;

  // Valider le lien profil si le jeu en demande un
  if (props.tournament.game.gameProfileLinkRegex) {
    if (!gameProfileLink.value) {
      toastStore.error('Le lien profil est requis pour ce jeu.');
      return;
    }
    if (!validateProfileLink(gameProfileLink.value, props.tournament.game.gameProfileLinkRegex)) {
      toastStore.error(`Lien invalide. Format regex: ${props.tournament.game.gameProfileLinkRegex}`);
      return;
    }
  }

  await playerLevelStore.setGameLevel(props.tournament.game, {
    level,
    selectedRoles,
    gameUsername,
    isRanked: isRankedValue,
    rank,
    comment,
    gameProfileLink: gameProfileLink.value || undefined
  });

  await useTournamentStore().fetchTournaments();

  showLevelForm.value = false;
  gameProfileLink.value = '';
  profileLinkError.value = '';
};
</script>

<template>
  <Card class="p-6 bg-christmas-navy/50 space-y-4" style="border: 2px solid #D4AF37;">
    <template #header>
      <h2 class="text-xl font-bold text-christmas-gold">Mon niveau</h2>
    </template>

    <div v-if="tournament.game.currentPlayerLevel">
      <PlayerGameLevelDisplay :playerLevel="tournament.game.currentPlayerLevel" />
    </div>
    <Button v-else-if="!showLevelForm" class="w-full" @click="showLevelForm = true">
      Définir mon niveau
    </Button>
    <form v-else @submit.prevent="onSubmitHandler">
      <!-- Niveau selection -->
      <div class="space-y-4">
        <div>
          <label for="level" class="block mb-2 text-sm font-medium text-christmas-gold">Sélectionnez votre niveau de jeu :</label>
          <select id="level" name="level" class="bg-christmas-navy border border-christmas-gold text-christmas-gold text-sm rounded-lg focus:ring-christmas-gold focus:border-christmas-gold block w-full p-2.5">
            <option value="débutant">Débutant</option>
            <option value="intermédiaire">Intermédiaire</option>
            <option value="avancé">Avancé</option>
            <option value="expert">Expert</option>
          </select>
        </div>
        <div v-if="tournament.game.roles?.length">
          <label for="role" class="block mb-2 text-sm font-medium text-christmas-gold">Sélectionnez votre rôle préféré :</label>
          <select id="role" name="role" class="bg-christmas-navy border border-christmas-gold text-christmas-gold text-sm rounded-lg focus:ring-christmas-gold focus:border-christmas-gold block w-full p-2.5">
            <option v-for="role in tournament.game.roles" :value="role.name" :key="role.id" :style="{ color: role.color }">{{ role.name }}</option>
          </select>
        </div>
        <div>
          <label for="gameUsername" class="block mb-2 text-sm font-medium text-christmas-gold">Votre nom d'utilisateur dans le jeu :</label>
          <input type="text" name="gameUsername" class="bg-christmas-navy border border-christmas-gold text-christmas-gold text-sm rounded-lg focus:ring-christmas-gold focus:border-christmas-gold block w-full p-2.5" placeholder="Votre nom d'utilisateur" :required="isRanked" />
        </div>
        <div v-if="tournament.game.gameProfileLinkRegex" class="border-t border-christmas-gold/20 pt-4">
          <label for="gameProfileLink" class="block mb-2 text-sm font-medium text-christmas-gold">Lien vers votre profil :</label>
          <input
            v-model="gameProfileLink"
            type="url"
            name="gameProfileLink"
            class="bg-christmas-navy border text-christmas-gold text-sm rounded-lg focus:ring-christmas-gold focus:border-christmas-gold block w-full p-2.5"
            :class="{ 'border-christmas-red': profileLinkError, 'border-christmas-gold': !profileLinkError }"
            @input="onProfileLinkChange"
            :required="!!tournament.game.gameProfileLinkRegex"
          />
          <p v-if="profileLinkError" class="text-xs text-christmas-red mt-1 flex items-center gap-1">
            <VueIcon name="bs:exclamation-circle" />
            {{ profileLinkError }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <input v-model="isRanked" type="checkbox" id="isranked" name="isranked" class="w-4 h-4">
          <label for="isranked" class="text-sm font-medium text-christmas-gold">Je joue en classé</label>
        </div>
        <div v-if="isRanked">
          <label for="rank" class="block mb-2 text-sm font-medium text-christmas-gold">Votre rang actuel :</label>
          <input type="text" name="rank" class="bg-christmas-navy border border-christmas-gold text-christmas-gold text-sm rounded-lg focus:ring-christmas-gold focus:border-christmas-gold block w-full p-2.5" placeholder="Votre rang" :required="isRanked" />
        </div>
        <div>
          <label for="comment" class="block mb-2 text-sm font-medium text-christmas-gold">Commentaire (optionnel) :</label>
          <textarea name="comment" id="comment" placeholder="Un petit commentaire pour nous aider à mieux déterminer ton niveau ?"
          class="bg-christmas-navy border border-christmas-gold text-christmas-gold text-sm rounded-lg focus:ring-christmas-gold focus:border-christmas-gold block w-full p-2.5 resize-none h-24"
          ></textarea>
        </div>
        <div class="flex space-x-4">
          <Button type="submit" class="w-full bg-christmas-gold text-christmas-navy hover:bg-christmas-gold/80">
            Enregistrer
          </Button>
          <Button type="button" class="w-full from-christmas-navy to-christmas-midnight border border-christmas-gold text-christmas-gold hover:bg-christmas-navy/80" @click="showLevelForm = false">
            Annuler
          </Button>
        </div>
      </div>
    </form>
  </Card>
</template>