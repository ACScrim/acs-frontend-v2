<script setup lang="ts">
import { Button, Card } from '@/components/ui';
import usePlayerLevelStore from '@/stores/playerLevelStore';
import useTournamentStore from '@/stores/tournamentStore';
import type { PlayerGameLevel } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed, ref } from 'vue';

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
  comment: props.level?.comment || ''
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

const getLevelConfig = () => {
  const configs: Record<string, { color: string; bgColor: string; icon: string }> = {
    'débutant': { color: 'text-green-400', bgColor: 'bg-green-500/20', icon: 'bs:mortarboard' },
    'intermédiaire': { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', icon: 'bs:lightning-fill' },
    'avancé': { color: 'text-orange-400', bgColor: 'bg-orange-500/20', icon: 'bs:fire' },
    'expert': { color: 'text-red-400', bgColor: 'bg-red-500/20', icon: 'bs:crown-fill' }
  };
  return configs[form.value.level.toLowerCase()] || configs['débutant'] as { color: string; bgColor: string; icon: string };
};

const toggleRole = (role: string) => {
  const index = form.value.selectedRoles.indexOf(role);
  if (index > -1) {
    form.value.selectedRoles.splice(index, 1);
  } else {
    form.value.selectedRoles.push(role);
  }
};

const resetForm = () => {
  form.value = {
    level: 'débutant',
    selectedRoles: [],
    gameUsername: '',
    isRanked: false,
    rank: '',
    comment: ''
  };
};

const handleSubmit = async () => {
  if (!selectedGame.value) return;
  
  isLoading.value = true;
  try {
    await playerLevelStore.setGameLevel(selectedGame.value, {
      level: form.value.level,
      selectedRoles: form.value.selectedRoles,
      gameUsername: form.value.gameUsername,
      isRanked: form.value.isRanked,
      rank: form.value.rank,
      comment: form.value.comment
    });
    await playerLevelStore.fetchPlayerGameLevels();
    resetForm();
    emit('save');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit" v-if="games.length">
    <Card class="border-christmas-gold border-2 overflow-hidden hover:shadow-lg hover:shadow-christmas-gold/30 transition-all duration-300">
      <!-- Header avec image -->
      <template #header v-if="selectedGame">
        <div class="relative h-48 overflow-hidden">
          <img 
            :src="selectedGame.imageUrl" 
            :alt="`Bannière du jeu ${selectedGame.name}`"
            class="w-full h-full object-cover" 
          />
          <div class="absolute inset-0 bg-gradient-to-t from-christmas-navy to-transparent"></div>

          <div class="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
            <div>
              <h3 class="text-xl font-bold text-christmas-snow">{{ selectedGame.name }}</h3>
            </div>
            <div :class="[
              'px-3 py-1 rounded-lg font-bold flex items-center gap-2 border-2',
              getLevelConfig().color,
              getLevelConfig().bgColor,
              'border-current'
            ]">
              <VueIcon :name="getLevelConfig().icon" />
              <span>{{ form.level }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- Contenu principal avec formulaire -->
      <template #default>
        <div class="space-y-4 p-4">
          <!-- Sélecteur de jeu (caché si édition) -->
          <div v-if="!level">
            <label for="game" class="block text-sm font-medium text-christmas-gold mb-2">
              <VueIcon name="bs:controller" class="inline mr-2" />
              Sélectionnez un jeu
            </label>
            <select 
              v-model="selectedGameId"
              id="game"
              required
              class="w-full bg-christmas-navy border-2 border-christmas-gold/30 text-christmas-gold rounded-lg p-2 focus:border-christmas-gold focus:outline-none focus:ring-2 focus:ring-christmas-gold/20 transition-all"
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
              <label for="level" class="block text-sm font-medium text-christmas-gold mb-2">Niveau de jeu</label>
              <select 
                v-model="form.level"
                id="level"
                class="w-full bg-christmas-navy border-2 border-christmas-gold/30 text-christmas-gold rounded-lg p-2 focus:border-christmas-gold focus:outline-none focus:ring-2 focus:ring-christmas-gold/20 transition-all"
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
                <label for="gameUsername" class="block text-sm font-medium text-christmas-gold mb-2">
                  <VueIcon name="ca:user-filled" class="inline mr-2" />
                  Pseudo
                </label>
                <input 
                  v-model="form.gameUsername"
                  type="text"
                  id="gameUsername"
                  placeholder="Votre nom d'utilisateur"
                  required
                  class="w-full bg-christmas-navy border-2 border-christmas-gold/30 text-christmas-gold placeholder-christmas-gold-light/50 rounded-lg p-2 focus:border-christmas-gold focus:outline-none focus:ring-2 focus:ring-christmas-gold/20 transition-all"
                />
              </div>

              <div v-if="form.isRanked">
                <label for="rank" class="block text-sm font-medium text-christmas-gold mb-2">
                  <VueIcon name="bs:star-fill" class="inline mr-2" />
                  Rang
                </label>
                <input 
                  v-model="form.rank"
                  type="text"
                  id="rank"
                  placeholder="Ex: Diamant"
                  class="w-full bg-christmas-navy border-2 border-christmas-gold/30 text-christmas-gold placeholder-christmas-gold-light/50 rounded-lg p-2 focus:border-christmas-gold focus:outline-none focus:ring-2 focus:ring-christmas-gold/20 transition-all"
                />
              </div>
            </div>

            <!-- Rôles préférés -->
            <div class="border-t border-christmas-gold/20 pt-4">
              <p class="text-sm font-medium text-christmas-gold mb-3">Rôles préférés</p>
              <div v-if="selectedGame.roles?.length" class="flex flex-wrap gap-2">
                <button 
                  v-for="role in selectedGame.roles" 
                  :key="role.name"
                  type="button"
                  @click="toggleRole(role.name)"
                  :class="[
                    'px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                    form.selectedRoles.includes(role.name)
                      ? 'bg-christmas-gold/20 border-christmas-gold text-christmas-gold'
                      : 'bg-christmas-navy border-christmas-gold/30 text-christmas-gold-light hover:border-christmas-gold'
                  ]"
                  :style="form.selectedRoles.includes(role.name) ? { borderColor: role.color, color: role.color } : {}"
                >
                  {{ role.name }}
                </button>
              </div>
              <div v-else class="text-christmas-gold-light/50 text-sm italic">
                Aucun rôle disponible pour ce jeu.
              </div>
            </div>

            <!-- Mode classé -->
            <div class="border-t border-christmas-gold/20 pt-4 flex items-center gap-3">
              <input 
                v-model="form.isRanked"
                type="checkbox"
                id="isRanked"
                class="w-4 h-4 cursor-pointer"
              />
              <label for="isRanked" class="text-sm font-medium text-christmas-gold cursor-pointer">
                Je joue en mode classé
              </label>
            </div>

            <!-- Commentaire -->
            <div class="border-t border-christmas-gold/20 pt-4">
              <label for="comment" class="block text-sm font-medium text-christmas-gold mb-2">Commentaire</label>
              <textarea 
                v-model="form.comment"
                id="comment"
                placeholder="Ajoutez un commentaire optionnel..."
                rows="3"
                class="w-full bg-christmas-navy border-2 border-christmas-gold/30 text-christmas-gold placeholder-christmas-gold-light/50 rounded-lg p-2 focus:border-christmas-gold focus:outline-none focus:ring-2 focus:ring-christmas-gold/20 transition-all resize-none"
              ></textarea>
            </div>
          </template>
        </div>
      </template>

      <!-- Boutons d'action -->
      <template #footer v-if="selectedGame">
        <div class="flex gap-2 justify-end p-4 border-t border-christmas-gold/20">
          <Button 
            type="button"
            variant="outline"
            class="flex items-center gap-2"
            @click="emit('cancel')"
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