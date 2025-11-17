<script setup lang="ts">
import { Button, Card } from '@/components/ui';
import useProposalStore from '@/stores/proposalStore';
import { useToastStore } from '@/stores/toastStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed, ref, watch } from 'vue';

interface Props {
  isLoading?: boolean;
  isEditing?: boolean;
  editingGame?: { id: string; name: string; roles: Array<{ name: string; color: string }>; gameProfileLinkRegex?: string; gameUsernameRegex?: string };
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  isEditing: false,
});

const emit = defineEmits<{
  submit: [data: { name: string; rawgId?: number; imageUrl: string; description?: string; roles: Array<{ name: string; color: string }>; gameProfileLinkRegex?: string; gameUsernameRegex?: string }];
  cancel: [];
}>();

const proposalStore = useProposalStore();
const toastStore = useToastStore();

const gameQuery = ref('');
const selectedGameId = ref<string | undefined>(undefined);
const description = ref('');
const isSearching = ref(false);
const newRoleName = ref('');
const newRoleColor = ref('#FF0000');
const roles = ref<Array<{ name: string; color: string; tempId?: string }>>([]);
const gameProfileLinkRegex = ref('');
const gameUsernameRegex = ref('');
let searchTimer: number | null = null;

// Initialiser avec les données si en édition
watch(() => props.editingGame, (game) => {
  if (game && props.isEditing) {
    roles.value = [...game.roles];
    gameProfileLinkRegex.value = game.gameProfileLinkRegex || '';
    gameUsernameRegex.value = game.gameUsernameRegex || '';
  }
}, { immediate: true });

const selectedGame = computed(() => {
  return proposalStore.rawgGames.find(g => String(g.id) === selectedGameId.value) || null;
});

watch(() => gameQuery.value, (newQuery) => {
  if (searchTimer) clearTimeout(searchTimer);
  isSearching.value = true;

  if (newQuery.length >= 3) {
    searchTimer = window.setTimeout(() => {
      proposalStore.fetchRawgGames(newQuery);
      isSearching.value = false;
    }, 500);
  } else {
    isSearching.value = false;
    if (newQuery.length === 0) {
      proposalStore.rawgGames = [];
    }
  }
});

const addRole = () => {
  if (!newRoleName.value.trim()) {
    toastStore.error('Le nom du rôle ne peut pas être vide.');
    return;
  }

  if (roles.value.some(r => r.name.toLowerCase() === newRoleName.value.toLowerCase())) {
    toastStore.error('Ce rôle existe déjà.');
    return;
  }

  roles.value.push({
    name: newRoleName.value.trim(),
    color: newRoleColor.value,
    tempId: Math.random().toString(36).substr(2, 9)
  });

  newRoleName.value = '';
  newRoleColor.value = '#FF0000';
};

const removeRole = (index: number) => {
  roles.value.splice(index, 1);
};

const validateRegex = (regexStr: string): boolean => {
  try {
    new RegExp(regexStr);
    return true;
  } catch {
    return false;
  }
};

const handleSubmit = async () => {
  if (!props.isEditing && !selectedGame.value) {
    toastStore.error('Veuillez sélectionner un jeu valide.');
    return;
  }

  if (!props.isEditing && !selectedGame.value?.background_image) {
    toastStore.error('Le jeu sélectionné n\'a pas d\'image valide.');
    return;
  }

  // Valider la regex si fournie
  if (gameProfileLinkRegex.value && !validateRegex(gameProfileLinkRegex.value)) {
    toastStore.error('La regex fournie est invalide.');
    return;
  }

  if (gameUsernameRegex.value && !validateRegex(gameUsernameRegex.value)) {
    toastStore.error('La regex de pseudo fournie est invalide.');
    return;
  }

  const rolesData = roles.value.map(r => ({
    name: r.name,
    color: r.color
  }));

  emit('submit', {
    name: props.isEditing ? props.editingGame?.name || '' : selectedGame.value?.name || '',
    rawgId: props.isEditing ? undefined : selectedGame.value?.id,
    imageUrl: props.isEditing ? '' : selectedGame.value?.background_image || '',
    description: description.value || undefined,
    roles: rolesData,
    gameProfileLinkRegex: gameProfileLinkRegex.value || undefined,
    gameUsernameRegex: gameUsernameRegex.value || undefined
  });

  // Reset form
  if (!props.isEditing) {
    gameQuery.value = '';
    selectedGameId.value = undefined;
    description.value = '';
    proposalStore.rawgGames = [];
  }
};

const handleCancel = () => {
  gameQuery.value = '';
  selectedGameId.value = undefined;
  description.value = '';
  roles.value = [];
  newRoleName.value = '';
  newRoleColor.value = '#FF0000';
  gameProfileLinkRegex.value = '';
  gameUsernameRegex.value = '';
  proposalStore.rawgGames = [];
  emit('cancel');
};
</script>

<template>
  <Card class="bg-christmas-navy/50 border-2 border-christmas-gold/30 p-6">
    <template #header>
      <h2 class="text-2xl font-bold bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-gold bg-clip-text text-transparent flex items-center gap-2">
        <VueIcon :name="isEditing ? 'bs:pencil-square' : 'bs:plus-circle'" class="text-christmas-gold" />
        {{ isEditing ? `Modifier le jeu - ${editingGame?.name}` : 'Ajouter un jeu' }}
      </h2>
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Recherche de jeu (uniquement en création) -->
      <div v-if="!isEditing">
        <label class="block text-christmas-gold font-bold text-sm mb-2">Rechercher un jeu RAWG *</label>
        <div class="space-y-3">
          <input
            v-model="gameQuery"
            type="text"
            placeholder="Ex: Counter-Strike, Valorant..."
            class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-3 py-2 text-sm focus:border-christmas-gold outline-none placeholder-christmas-gold-light/30"
          />
          
          <!-- Résultats de recherche -->
          <div v-if="gameQuery.length >= 3" class="space-y-2">
            <div v-if="isSearching" class="text-christmas-gold-light text-sm italic flex items-center gap-2">
              <VueIcon name="bs:hourglass-split" class="animate-spin" />
              Recherche en cours...
            </div>
            <div v-else-if="proposalStore.rawgGames.length === 0" class="text-christmas-gold-light/50 text-sm italic">
              Aucun jeu trouvé pour cette recherche.
            </div>
            <select
              v-else
              v-model="selectedGameId"
              class="w-full bg-christmas-navy border-2 border-christmas-gold/30 text-christmas-gold rounded-lg p-2 focus:border-christmas-gold focus:outline-none focus:ring-2 focus:ring-christmas-gold/20 transition-all"
            >
              <option value="">-- Sélectionner un jeu --</option>
              <option v-for="game in proposalStore.rawgGames" :key="game.id" :value="String(game.id)">
                {{ game.name }}
              </option>
            </select>
          </div>
          <p class="text-xs text-christmas-gold-light/70 flex items-center gap-2">
            <VueIcon name="bs:info-circle" />
            Commencez à taper au moins 3 caractères pour rechercher
          </p>
        </div>
      </div>

      <!-- Aperçu du jeu sélectionné (uniquement en création) -->
      <div v-if="!isEditing && selectedGame" class="p-4 bg-christmas-navy/30 border border-christmas-gold/30 rounded-lg space-y-3">
        <div class="flex items-start gap-4">
          <img
            v-if="selectedGame.background_image"
            :src="selectedGame.background_image"
            :alt="selectedGame.name"
            class="w-24 h-24 rounded-lg object-cover"
          />
          <div class="flex-1">
            <p class="text-lg font-bold text-christmas-ice">{{ selectedGame.name }}</p>
            <p class="text-sm text-christmas-gold-light/70">RAWG ID: {{ selectedGame.id }}</p>
            <p v-if="selectedGame.release_date" class="text-sm text-christmas-gold-light/70">
              Sortie: {{ new Date(selectedGame.release_date).toLocaleDateString('fr-FR') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Description (optionnel) -->
      <div v-if="!isEditing">
        <label class="block text-christmas-gold font-bold text-sm mb-2">Description (optionnel)</label>
        <textarea
          v-model="description"
          placeholder="Ajoutez une description pour ce jeu..."
          class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-3 py-2 text-sm focus:border-christmas-gold outline-none placeholder-christmas-gold-light/30 resize-none"
          rows="3"
        />
      </div>

      <!-- Rôles -->
      <div class="border-t border-christmas-gold/20 pt-4">
        <h3 class="text-christmas-gold font-bold text-sm mb-3 flex items-center gap-2">
          <VueIcon name="bs:shield-fill" />
          Rôles du jeu
        </h3>

        <!-- Ajouter un rôle -->
        <div class="bg-christmas-navy/30 p-4 rounded-lg mb-3 space-y-3 border border-christmas-gold/20">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              v-model="newRoleName"
              type="text"
              placeholder="Nom du rôle (ex: Assassin, Support...)"
              class="bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-3 py-2 text-sm focus:border-christmas-gold outline-none placeholder-christmas-gold-light/30"
              @keyup.enter="addRole"
            />
            <div class="flex items-center gap-2">
              <input
                v-model="newRoleColor"
                type="color"
                class="w-full h-10 rounded cursor-pointer border border-christmas-gold/30"
              />
              <span class="text-christmas-gold-light text-sm whitespace-nowrap">Couleur</span>
            </div>
            <Button
              type="button"
              @click="addRole"
              color="christmas-gold"
              class="flex items-center justify-center gap-2 h-fit"
            >
              <VueIcon name="bs:plus-circle" />
              Ajouter
            </Button>
          </div>
        </div>

        <!-- Liste des rôles -->
        <div v-if="roles.length > 0" class="space-y-2">
          <div
            v-for="(role, index) in roles"
            :key="role.tempId || role.name"
            class="flex items-center justify-between p-3 bg-christmas-navy/30 rounded-lg border-l-4"
            :style="{ borderLeftColor: role.color }"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-4 h-4 rounded"
                :style="{ backgroundColor: role.color }"
              />
              <span class="text-christmas-gold">{{ role.name }}</span>
            </div>
            <Button
              type="button"
              @click="removeRole(index)"
              color="christmas-red"
              class="flex items-center gap-1 h-fit px-2 py-1"
            >
              <VueIcon name="bs:trash" class="text-sm" />
              Retirer
            </Button>
          </div>
        </div>
        <div v-else class="text-christmas-gold-light/50 text-sm italic">
          Aucun rôle ajouté. (Optionnel)
        </div>
      </div>

      <!-- Regex de lien profil -->
      <div class="border-t border-christmas-gold/20 pt-4">
        <div class="flex items-center gap-2 text-christmas-gold font-bold text-sm mb-2">
          <VueIcon name="bs:link-45deg" />
          <label>Regex de lien profil (optionnel)</label>
        </div>
        <div class="space-y-2">
          <input
            v-model="gameProfileLinkRegex"
            type="text"
            placeholder="Ex: ^https://op\\.gg/summoners/.*"
            class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-3 py-2 text-sm focus:border-christmas-gold outline-none placeholder-christmas-gold-light/30"
          />
          <p class="text-xs text-christmas-gold-light/70 flex items-center gap-2">
            <VueIcon name="bs:info-circle" />
            Format regex pour valider les liens profils des joueurs. Exemples:
          </p>
          <div class="bg-christmas-navy/20 border border-christmas-gold/20 rounded p-2 text-xs text-christmas-gold-light space-y-1">
            <div>• League of Legends: <code class="bg-black/30 px-1 rounded">^https://op\.gg/summoners/.*</code></div>
            <div>• Valorant: <code class="bg-black/30 px-1 rounded">^https://tracker\.gg/valorant/profile/.*</code></div>
            <div>• Dota 2: <code class="bg-black/30 px-1 rounded">^https://www\.dotabuff\.com/players/.*</code></div>
          </div>
        </div>
      </div>

      <!-- Regex de pseudo -->
      <div class="border-t border-christmas-gold/20 pt-4">
        <div class="flex items-center gap-2 text-christmas-gold font-bold text-sm mb-2">
          <VueIcon name="bs:person-badge" />
          <label>Regex de pseudo (optionnel)</label>
        </div>
        <div class="space-y-2">
          <input
            v-model="gameUsernameRegex"
            type="text"
            placeholder="Ex: ^[a-zA-Z0-9_]{3,16}$"
            class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-3 py-2 text-sm focus:border-christmas-gold outline-none placeholder-christmas-gold-light/30"
          />
          <p class="text-xs text-christmas-gold-light/70 flex items-center gap-2">
            <VueIcon name="bs:info-circle" />
            Format regex pour valider les pseudos des joueurs. Exemples:
          </p>
          <div class="bg-christmas-navy/20 border border-christmas-gold/20 rounded p-2 text-xs text-christmas-gold-light space-y-1">
            <div>• Alphanumérique simple: <code class="bg-black/30 px-1 rounded">^[a-zA-Z0-9]{3,20}$</code></div>
            <div>• Avec underscores: <code class="bg-black/30 px-1 rounded">^[a-zA-Z0-9_]{3,16}$</code></div>
            <div>• Avec tirets: <code class="bg-black/30 px-1 rounded">^[a-zA-Z0-9_-]{3,20}$</code></div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3 pt-4 border-t border-christmas-gold/20">
        <Button
          type="button"
          @click="handleCancel"
          color="christmas-red"
          class="flex items-center gap-2"
        >
          <VueIcon name="bs:x-circle" />
          Annuler
        </Button>
        <Button
          type="submit"
          :disabled="isLoading || (!isEditing && !selectedGame)"
          class="flex items-center gap-2"
        >
          <VueIcon :name="isLoading ? 'bs:hourglass-split' : (isEditing ? 'bs:check-circle' : 'bs:plus-circle')" :class="{ 'animate-spin': isLoading }" />
          {{ isLoading ? 'En cours...' : (isEditing ? 'Modifier' : 'Ajouter') }}
        </Button>
      </div>
    </form>
  </Card>
</template>