<script setup lang="ts">
import {Button, Card} from '@/components/ui';
import PlayerGameLevelDisplay from '@/components/tournaments/PlayerGameLevelDisplay.vue';
import usePlayerLevelStore from '@/stores/playerLevelStore';
import useTournamentStore from '@/stores/tournamentStore';
import {useToastStore} from '@/stores/toastStore';
import type {Tournament} from '@/types/models';
import {computed, ref} from 'vue';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import {getGameColor} from '../composables/useGameColor';

const props = defineProps<{
  tournament: Tournament;
}>();

const playerLevelStore = usePlayerLevelStore();
const toastStore = useToastStore();

const showLevelForm = ref(false);
const isRanked = ref(false);
const gameProfileLink = ref('');
const profileLinkError = ref('');
const gameUsername = ref('');
const usernameError = ref('');

// ...existing code...

const headerColor = computed((): string => {
  const gameId = props.tournament.gameId || 'default';
  return getGameColor(gameId);
});

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

const validateUsername = (username: string, gameUsernameRegex: string): boolean => {
  if (!gameUsernameRegex) return true;
  if (!username) return false;
  try {
    const regex = new RegExp(gameUsernameRegex);
    return regex.test(username);
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

const onUsernameChange = () => {
  usernameError.value = '';
  if (gameUsername.value && !validateUsername(gameUsername.value, props.tournament.game.gameUsernameRegex || '')) {
    usernameError.value = `Format regex: ${props.tournament.game.gameUsernameRegex}`;
  }
};

const onSubmitHandler = async (e: Event) => {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);
  const level = formData.get('level') as string;
  const selectedRoles = formData.getAll('role') as string[];
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

  // Valider le username si le jeu en demande un
  if (!gameUsername.value || gameUsername.value.trim() === '') {
    toastStore.error('Le nom d\'utilisateur est requis pour ce jeu.');
    return;
  }
  if (props.tournament.game.gameUsernameRegex) {
    if (!validateUsername(gameUsername.value, props.tournament.game.gameUsernameRegex)) {
      toastStore.error(`Pseudo invalide. Format regex: ${props.tournament.game.gameUsernameRegex}`);
      return;
    }
  }

  await playerLevelStore.setGameLevel(props.tournament.game, {
    level,
    selectedRoles,
    gameUsername: gameUsername.value,
    isRanked: isRankedValue,
    rank,
    comment,
    gameProfileLink: gameProfileLink.value || undefined
  });

  await useTournamentStore().fetchTournaments();

  showLevelForm.value = false;
  gameProfileLink.value = '';
  gameUsername.value = '';
  profileLinkError.value = '';
  usernameError.value = '';
};
</script>

<template>
  <Card class="p-6 bg-white/5 border border-white/10 space-y-4" style="border-radius: var(--radius-xl);">
    <template #header>
      <h2
        class="text-xl font-bold text-foam-50 pl-4 -ml-4 py-1 border-l-4"
        :style="{ borderLeftColor: headerColor }"
      >
        Mon niveau
      </h2>
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
          <label for="level" class="block mb-2 text-sm font-medium text-foam-200">Sélectionnez votre niveau de jeu :</label>
          <select id="level" name="level" class="bg-ink-900 border border-white/10 text-foam-50 text-sm rounded-lg focus:ring-accent-300 focus:border-accent-300 block w-full p-2.5">
            <option value="débutant">Débutant</option>
            <option value="intermédiaire">Intermédiaire</option>
            <option value="avancé">Avancé</option>
            <option value="expert">Expert</option>
          </select>
        </div>
        <div v-if="tournament.game.roles?.length">
          <label for="role" class="block mb-2 text-sm font-medium text-foam-200">Sélectionnez votre rôle préféré :</label>
          <select id="role" name="role" class="bg-ink-900 border border-white/10 text-foam-50 text-sm rounded-lg focus:ring-accent-300 focus:border-accent-300 block w-full p-2.5">
            <option v-for="role in tournament.game.roles" :value="role.name" :key="role.id" :style="{ color: role.color }">{{ role.name }}</option>
          </select>
        </div>
        <div>
          <label for="gameUsername" class="block mb-2 text-sm font-medium text-foam-200">Votre nom d'utilisateur dans le jeu :</label>
          <input
            v-model="gameUsername"
            type="text"
            name="gameUsername"
            class="bg-ink-900 border text-foam-50 text-sm rounded-lg focus:ring-accent-300 focus:border-accent-300 block w-full p-2.5 placeholder:text-foam-300/60"
            :class="{ 'border-blush-500': usernameError, 'border-white/10': !usernameError }"
            placeholder="Votre nom d'utilisateur"
            @input="onUsernameChange"
            :required="!!tournament.game.gameUsernameRegex"
          />
          <p v-if="usernameError" class="text-xs text-blush-400 mt-1 flex items-center gap-1">
            <VueIcon name="bs:exclamation-circle" />
            {{ usernameError }}
          </p>
        </div>
        <div v-if="tournament.game.gameProfileLinkRegex" class="border-t border-white/10 pt-4">
          <label for="gameProfileLink" class="block mb-2 text-sm font-medium text-foam-200">Lien vers votre profil :</label>
          <input
            v-model="gameProfileLink"
            type="url"
            name="gameProfileLink"
            class="bg-ink-900 border text-foam-50 text-sm rounded-lg focus:ring-accent-300 focus:border-accent-300 block w-full p-2.5 placeholder:text-foam-300/60"
            :class="{ 'border-blush-500': profileLinkError, 'border-white/10': !profileLinkError }"
            @input="onProfileLinkChange"
            :required="!!tournament.game.gameProfileLinkRegex"
          />
          <p v-if="profileLinkError" class="text-xs text-blush-400 mt-1 flex items-center gap-1">
            <VueIcon name="bs:exclamation-circle" />
            {{ profileLinkError }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <input v-model="isRanked" type="checkbox" id="isranked" name="isranked" class="form-checkbox">
          <label for="isranked" class="text-sm font-medium text-foam-200">Je joue en classé</label>
        </div>
        <div v-if="isRanked">
          <label for="rank" class="block mb-2 text-sm font-medium text-foam-200">Votre rang actuel :</label>
          <input type="text" name="rank" class="bg-ink-900 border border-white/10 text-foam-50 text-sm rounded-lg focus:ring-accent-300 focus:border-accent-300 block w-full p-2.5" placeholder="Votre rang" :required="isRanked" />
        </div>
        <div>
          <label for="comment" class="block mb-2 text-sm font-medium text-foam-200">Commentaire (optionnel) :</label>
          <textarea name="comment" id="comment" placeholder="Un petit commentaire pour nous aider à mieux déterminer ton niveau ?"
          class="bg-ink-900 border border-white/10 text-foam-50 text-sm rounded-lg focus:ring-accent-300 focus:border-accent-300 block w-full p-2.5 resize-none h-24 placeholder:text-foam-300/60"
          ></textarea>
        </div>
        <div class="flex space-x-4">
          <Button type="submit" class="w-full">
            Enregistrer
          </Button>
          <Button type="button" class="w-full" variant="ghost" @click="showLevelForm = false">
            Annuler
          </Button>
        </div>
      </div>
    </form>
  </Card>
</template>