<script setup lang="ts">
import {Button, Card} from '@/components/ui';
import useProposalStore from '@/stores/proposalStore';
import {useToastStore} from '@/stores/toastStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import {computed, ref, watch} from 'vue';
import ACSSelect from "@/components/ui/ACSSelect.vue";

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
  <Card class="glass-panel p-6 space-y-6">
    <template #header>
      <div class="flex items-center gap-3">
        <span class="rounded-2xl bg-white/5 p-3">
          <VueIcon :name="isEditing ? 'bs:pencil-square' : 'bs:plus-circle'" class="text-accent-300" />
        </span>
        <div>
          <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">{{ isEditing ? 'Modification' : 'Ajout' }}</p>
          <h2 class="hero-title text-2xl">{{ isEditing ? `Modifier ${editingGame?.name}` : 'Ajouter un jeu' }}</h2>
        </div>
      </div>
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div v-if="!isEditing" class="space-y-3">
        <label class="form-label">Rechercher un jeu RAWG *</label>
        <input v-model="gameQuery" type="text" placeholder="Ex: Valorant" class="form-input" />
        <div v-if="gameQuery.length >= 3" class="space-y-2">
          <p v-if="isSearching" class="text-xs text-foam-300/70">Recherche…</p>
          <ACSSelect v-else v-model="selectedGameId" defaultOptionLabel="-- Sélectionner un jeu --" :options="proposalStore.rawgGames.map(g => ({ label: g.name, value: String(g.id) }))" />
        </div>
      </div>

      <div v-if="!isEditing && selectedGame" class="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-4 flex gap-4">
        <img :src="selectedGame.background_image as string | undefined" class="h-24 w-24 rounded-2xl object-cover"  :alt="`Image du jeu ${selectedGame.name}`" loading="lazy"/>
        <div>
          <p class="text-lg font-semibold text-white">{{ selectedGame.name }}</p>
          <p class="text-sm text-foam-300/70">RAWG ID: {{ selectedGame.id }}</p>
        </div>
      </div>

      <div class="space-y-3">
        <label class="form-label">Rôles</label>
        <div class="grid gap-3 md:grid-cols-[2fr_1fr_auto]">
          <input v-model="newRoleName" type="text" placeholder="Nom du rôle" class="form-input" />
          <input v-model="newRoleColor" type="color" class="h-12 w-full rounded-[var(--radius-lg)] border border-white/10" />
          <Button type="button" class="gap-2" @click="addRole"><VueIcon name="bs:plus-circle" />Ajouter</Button>
        </div>
        <div v-if="roles.length" class="space-y-2">
          <div v-for="(role, index) in roles" :key="role.tempId || role.name" class="flex items-center justify-between rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-3">
            <div class="flex items-center gap-3">
              <span class="h-4 w-4 rounded" :style="{ backgroundColor: role.color }" />
              <p class="text-white">{{ role.name }}</p>
            </div>
            <Button type="button" variant="ghost" size="sm" @click="removeRole(index)">Supprimer</Button>
          </div>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="form-label">Regex lien profil</label>
          <input v-model="gameProfileLinkRegex" type="text" class="form-input" placeholder="^https://…" />
        </div>
        <div>
          <label class="form-label">Regex pseudo</label>
          <input v-model="gameUsernameRegex" type="text" class="form-input" placeholder="^[a-zA-Z0-9_]{3,16}$" />
        </div>
      </div>

      <div class="flex justify-end gap-3 border-t border-white/5 pt-4">
        <Button type="button" variant="ghost" @click="handleCancel">Annuler</Button>
        <Button type="submit" :disabled="isLoading || (!isEditing && !selectedGame)">
          {{ isLoading ? 'En cours…' : isEditing ? 'Modifier' : 'Ajouter' }}
        </Button>
      </div>
    </form>
  </Card>
</template>