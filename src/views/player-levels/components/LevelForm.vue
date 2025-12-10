<script setup lang="ts">
import { Button, Card } from '@/components/ui';
import usePlayerLevelStore from '@/stores/playerLevelStore';
import { useToastStore } from '@/stores/toastStore';
import useTournamentStore from '@/stores/tournamentStore';
import type { PlayerGameLevel } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed, ref } from 'vue';
import { getErrorMessage } from '@/utils';

interface Props {
  level?: PlayerGameLevel;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  cancel: [];
  save: [];
}>();

const playerLevelStore = usePlayerLevelStore();
const tournamentStore = useTournamentStore();
const toastStore = useToastStore();
const isLoading = ref(false);

const selectedGameId = ref(props.level?.game.id || '');
const selectedGame = computed(() => {
  if (props.level) {
    return props.level.game;
  }
  return tournamentStore.tournaments
    .flatMap(t => t.game)
    .find(g => g.id === selectedGameId.value);
});

const form = ref({
  level: props.level?.level || 'débutant',
  selectedRoles: props.level?.selectedRoles || [],
  gameUsername: props.level?.gameUsername || '',
  isRanked: props.level?.isRanked || false,
  rank: props.level?.rank || '',
  comment: props.level?.comment || '',
  gameProfileLink: props.level?.gameProfileLink || ''
});

const games = computed(() => {
  return Array.from(
    new Map(
      tournamentStore.tournaments
        .map(t => t.game)
        .filter(g => !playerLevelStore.levels.flatMap(l => l.game.id).includes(g.id))
        .map(game => [game.id, game])
    ).values()
  );
});

const toggleRole = (role: string) => {
  const index = form.value.selectedRoles.indexOf(role);
  if (index > -1) {
    form.value.selectedRoles.splice(index, 1);
  } else {
    form.value.selectedRoles.push(role);
  }
};

const validateProfileLink = (): boolean => {
  if (!selectedGame.value?.gameProfileLinkRegex) {
    // Si pas de regex, le lien n'est pas obligatoire
    return true;
  }

  // Si regex existe, le lien devient obligatoire
  if (!form.value.gameProfileLink.trim()) {
    toastStore.error(`Un lien profil est requis pour ${selectedGame.value.name}.`);
    return false;
  }

  // Valider que le lien est une URL valide
  try {
    new URL(form.value.gameProfileLink);
  } catch {
    toastStore.error('Le lien profil doit être une URL valide.');
    return false;
  }

  return true;
};

const validateUsername = (): boolean => {
  if (!selectedGame.value?.gameUsernameRegex) {
    // Si pas de regex, le pseudo n'est pas obligatoire (au delà du required)
    return true;
  }

  // Si regex existe, le pseudo devient obligatoire
  if (!form.value.gameUsername.trim()) {
    toastStore.error(`Un pseudo est requis pour ${selectedGame.value.name}.`);
    return false;
  }

  // Valider le pseudo selon la regex
  try {
    const regex = new RegExp(selectedGame.value.gameUsernameRegex);
    if (!regex.test(form.value.gameUsername)) {
      toastStore.error(`Le pseudo ne respecte pas le format requis: ${selectedGame.value.gameUsernameRegex}`);
      return false;
    }
  } catch {
    toastStore.error('Format regex invalide.');
    return false;
  }

  return true;
};

const resetForm = () => {
  form.value = {
    level: 'débutant',
    selectedRoles: [],
    gameUsername: '',
    isRanked: false,
    rank: '',
    comment: '',
    gameProfileLink: ''
  };
  selectedGameId.value = '';
  isLoading.value = false
};

const handleSubmit = async () => {
  if (!selectedGame.value) return;

  if (!validateProfileLink()) {
    return;
  }

  if (!validateUsername()) {
    return;
  }

  isLoading.value = true;
  try {
    await playerLevelStore.setGameLevel(selectedGame.value, {
      level: form.value.level,
      selectedRoles: form.value.selectedRoles,
      gameUsername: form.value.gameUsername,
      isRanked: form.value.isRanked,
      rank: form.value.rank,
      comment: form.value.comment,
      gameProfileLink: form.value.gameProfileLink || undefined
    });
    await playerLevelStore.fetchPlayerGameLevels();
    resetForm();
    emit('save');
  } catch (error: unknown) {
    useToastStore().error('Erreur lors de la sauvegarde: ' + getErrorMessage(error));
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit" v-if="games.length">
    <Card class="border border-white/10 overflow-hidden hover:shadow-xl hover:shadow-accent-500/20 transition-all duration-300">
      <!-- Header avec image -->
      <template #header v-if="selectedGame">
        <div class="relative h-48 overflow-hidden">
          <img 
            :src="selectedGame.imageUrl" 
            :alt="`Bannière du jeu ${selectedGame.name}`"
            class="w-full h-full object-cover" 
          />
          <div class="absolute inset-0 bg-gradient-to-t from-ink-900 to-transparent"></div>

          <div class="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
            <h3 class="text-xl font-bold text-white">{{ selectedGame.name }}</h3>
          </div>
        </div>
      </template>

      <!-- Contenu principal avec formulaire -->
      <template #default>
        <div class="space-y-4 p-4">
          <!-- Sélecteur de jeu (caché si édition) -->
          <div v-if="!level">
            <label for="game" class="block text-sm font-medium text-foam-200 mb-2">
              <VueIcon name="bs:controller" class="inline mr-2" />
              Sélectionnez un jeu
            </label>
            <select 
              v-model="selectedGameId"
              id="game"
              required
              class="w-full bg-ink-900 border border-white/10 text-foam-50 rounded-lg p-2 focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20 transition-all"
            >
              <option value="">-- Choisir un jeu --</option>
              <option v-for="game in games" :key="game.id" :value="game.id">
                {{ game.name }}
              </option>
            </select>
          </div>

          <!-- Reste du formulaire visible si jeu sélectionné -->
          <template v-if="selectedGame">
            <!-- Sélecteur de niveau -->
            <div>
              <label for="level" class="block text-sm font-medium text-foam-200 mb-2">Niveau de jeu</label>
              <select
                v-model="form.level"
                id="level"
                class="w-full bg-ink-900 border border-white/10 text-foam-50 rounded-lg p-2 focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20 transition-all"
              >
                <option value="débutant">Débutant</option>
                <option value="intermédiaire">Intermédiaire</option>
                <option value="avancé">Avancé</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <!-- Pseudo et rang -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="gameUsername" class="block text-sm font-medium text-foam-200 mb-2">
                  <VueIcon name="ca:user-filled" class="inline mr-2" />
                  Pseudo
                  <span v-if="selectedGame?.gameUsernameRegex" class="text-blush-400">*</span>
                </label>
                <input 
                  v-model="form.gameUsername"
                  type="text"
                  id="gameUsername"
                  placeholder="Votre nom d'utilisateur"
                  required
                  class="w-full bg-ink-900 border border-white/10 text-foam-50 placeholder:text-foam-300/60 rounded-lg p-2 focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20 transition-all"
                />
                <p v-if="selectedGame?.gameUsernameRegex" class="text-xs text-foam-300/70 flex items-center gap-2 mt-2">
                  <VueIcon name="bs:info-circle" />
                  Format regex: {{ selectedGame.gameUsernameRegex }}
                </p>
              </div>

              <div v-if="form.isRanked">
                <label for="rank" class="block text-sm font-medium text-foam-200 mb-2">
                  <VueIcon name="bs:star-fill" class="inline mr-2" />
                  Rang
                </label>
                <input 
                  v-model="form.rank"
                  type="text"
                  id="rank"
                  placeholder="Ex: Diamant"
                  class="w-full bg-ink-900 border border-white/10 text-foam-50 placeholder:text-foam-300/60 rounded-lg p-2 focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20 transition-all"
                />
              </div>
            </div>

            <!-- Rôles préférés -->
            <div class="border-t border-white/10 pt-4">
              <p class="text-sm font-medium text-foam-200 mb-3">Rôles préférés</p>
              <div v-if="selectedGame.roles?.length" class="flex flex-wrap gap-2">
                <button 
                  v-for="role in selectedGame.roles" 
                  :key="role.name"
                  type="button"
                  @click="toggleRole(role.name)"
                  :class=" [
                    'px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                    form.selectedRoles.includes(role.name)
                      ? 'bg-white/10 border-white text-white'
                      : 'bg-ink-900 border-white/10 text-foam-200 hover:border-white/40'
                  ]"
                  :style="form.selectedRoles.includes(role.name) ? { borderColor: role.color, color: role.color } : {}"
                >
                  {{ role.name }}
                </button>
              </div>
              <div v-else class="text-foam-300/60 text-sm italic">
                Aucun rôle disponible pour ce jeu.
              </div>
            </div>

            <!-- Mode classé -->
            <div class="border-t border-white/10 pt-4 flex items-center gap-3">
              <input
                v-model="form.isRanked"
                type="checkbox"
                id="isRanked"
                class="form-checkbox"
              />
              <label for="isRanked" class="text-sm font-medium text-foam-200 cursor-pointer">
                Je joue en mode classé
              </label>
            </div>

            <!-- Lien profil (si regex existe pour le jeu) -->
            <div v-if="selectedGame.gameProfileLinkRegex" class="border-t border-white/10 pt-4">
              <div class="flex items-center gap-2 text-sm font-medium text-foam-200 mb-2">
                <VueIcon name="bs:link-45deg" />
                <label for="gameProfileLink">Lien profil *</label>
              </div>
              <div class="space-y-2">
                <input 
                  v-model="form.gameProfileLink"
                  type="url"
                  id="gameProfileLink"
                  placeholder="Ex: https://op.gg/summoners/..."
                  class="w-full bg-ink-900 border border-white/10 text-foam-50 placeholder:text-foam-300/60 rounded-lg p-2 focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20 transition-all"
                />
                <p class="text-xs text-foam-300/70 flex items-center gap-2">
                  <VueIcon name="bs:info-circle" />
                  Lien obligatoire pour ce jeu. Format regex: {{ selectedGame.gameProfileLinkRegex }}
                </p>
              </div>
            </div>

            <!-- Commentaire -->
            <div class="border-t border-white/10 pt-4">
              <label for="comment" class="block text-sm font-medium text-foam-200 mb-2">Commentaire</label>
              <textarea
                v-model="form.comment"
                id="comment"
                placeholder="Ajoutez un commentaire optionnel..."
                rows="3"
                class="w-full bg-ink-900 border border-white/10 text-foam-50 placeholder:text-foam-300/60 rounded-lg p-2 focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20 transition-all resize-none"
              ></textarea>
            </div>
          </template>
        </div>
      </template>

      <!-- Boutons d'action -->
      <template #footer v-if="selectedGame">
        <div class="flex gap-2 justify-end p-4 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            class="flex items-center gap-2"
            @click="resetForm(); emit('cancel')"
          >
            <VueIcon name="bs:x-lg" />
            Annuler
          </Button>
          <Button 
            type="submit"
            :disabled="isLoading || !form.gameUsername"
            class="flex items-center gap-2"
          >
            <VueIcon :name="isLoading ? 'bs:hourglass-split' : 'bs:check-lg'" />
            {{ isLoading ? 'Sauvegarde...' : 'Enregistrer' }}
          </Button>
        </div>
      </template>
    </Card>
  </form>
</template>