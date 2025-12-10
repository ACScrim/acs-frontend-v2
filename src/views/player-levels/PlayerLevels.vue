<script setup lang="ts">
import ListView from '@/components/global/ListView.vue';
import {Button, Card} from '@/components/ui';
import usePlayerLevelStore from '@/stores/playerLevelStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import {nextTick, onMounted, ref, watch} from 'vue';
import LevelForm from './components/LevelForm.vue';
import {useRoute} from "vue-router";

const playerLevelStore = usePlayerLevelStore();
const editingLevelId = ref<string | null>(null);

onMounted(() => {
  playerLevelStore.fetchPlayerGameLevels();
});

const getLevelConfig = (level: string) => {
  const normalizedLevel = level?.toLowerCase().trim() || 'débutant';
  const configs: Record<string, { color: string; bgColor: string; icon: string }> = {
    'débutant': { color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', icon: 'bs:mortarboard' },
    'intermédiaire': { color: 'text-amber-400', bgColor: 'bg-amber-500/20', icon: 'bs:lightning-fill' },
    'avancé': { color: 'text-orange-400', bgColor: 'bg-orange-500/20', icon: 'bs:fire' },
    'expert': { color: 'text-rose-400', bgColor: 'bg-rose-500/20', icon: 'bs:crown-fill' }
  };
  return configs[normalizedLevel] || configs['débutant'] as { color: string; bgColor: string; icon: string };
};

const handleDelete = async (levelId: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce niveau ?')) {
    await playerLevelStore.deletePlayerGameLevel(levelId);
  }
};

const handleEditCancel = () => {
  editingLevelId.value = null;
};

const handleEditSave = () => {
  editingLevelId.value = null;
};

/**
 * Scroll programmé vers l'élément identifié par le hash.
 * On attend le prochain tick et on retente quelques fois si l'élément n'est pas encore monté.
 */
async function scrollToHash(hash?: string) {
  if (!hash) return;
  const id = hash.startsWith('#') ? hash.slice(1) : hash;
  await nextTick();

  let el = document.getElementById(id);
  let attempts = 0;
  const maxAttempts = 6;
  while (!el && attempts < maxAttempts) {
    // courte pause pour laisser le DOM se stabiliser après rendu asynchrone
    // (utile si les items sont rendus après un fetch)
    // eslint-disable-next-line no-await-in-loop
    await new Promise(r => setTimeout(r, 100));
    el = document.getElementById(id);
    attempts++;
  }
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    // console.info peut rester si besoin de debug
    console.info(`Element with id "${id}" not found for hash scrolling.`);
  }
}

const route = useRoute()

onMounted(() => {
  scrollToHash(route.hash);
})

</script>

<template>
  <section class="space-y-8">
    <header class="space-y-2">
      <p class="text-xs uppercase tracking-[0.4em] text-foam-300/60">Profil compétitif</p>
      <h1 class="hero-title">Mes niveaux de jeu</h1>
      <p class="muted">Gérez vos niveaux et vos informations de jeu</p>
    </header>

    <ListView
      :data="playerLevelStore.levels"
      title=""
      empty-message="Vous n'avez pas encore défini de niveaux de jeu. Ajoutez votre premier jeu pour commencer."
    >
      <template #add-append>
        <LevelForm />
      </template>

      <template #item="{ item: level }">
        <template v-if="editingLevelId !== level.id">
          <Card class="glass-panel overflow-hidden" :id="level.gameId">
            <template #header>
              <div class="relative h-48">
                <img :src="level.game.imageUrl" :alt="`Bannière du jeu ${level.game.name}`" class="h-full w-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
                <div class="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-4 p-4">
                  <div>
                    <p class="text-xs uppercase tracking-[0.3em] text-foam-200/70">Jeu</p>
                    <h3 class="text-2xl font-semibold text-white">{{ level.game.name }}</h3>
                  </div>
                </div>
              </div>
            </template>

            <div class="grid gap-6 p-6 md:grid-cols-2">
              <div class="space-y-2 col-span-2">
                <span :class="`inline-flex items-center gap-2 rounded-full border px-4 py-1 text-sm font-semibold ${getLevelConfig(level.level).color} ${getLevelConfig(level.level).bgColor} border-white/20`">
                  <VueIcon :name="getLevelConfig(level.level).icon" />
                  {{ level.level.toLowerCase().trim() }}
                </span>
              </div>
              <div class="space-y-2">
                <p class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Pseudo</p>
                <p class="text-lg font-semibold text-white">{{ level.gameUsername }}</p>
              </div>
              <div class="space-y-2">
                <p class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Rang</p>
                <p class="text-lg font-semibold" :class="level.rank ? 'text-white' : 'text-foam-300/50'">{{ level.rank || 'Non classé' }}</p>
              </div>
              <div class="md:col-span-2 space-y-3">
                <p class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Rôles préférés</p>
                <div class="flex flex-wrap gap-2" v-if="level.selectedRoles?.length">
                  <span v-for="role in level.selectedRoles" :key="role" class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80">{{ role }}</span>
                </div>
                <p v-else class="text-sm text-foam-300/60 italic">Aucun rôle préféré défini.</p>
              </div>
              <div class="space-y-3">
                <p class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Lien profil</p>
                <a v-if="level.gameProfileLink" :href="level.gameProfileLink" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-accent-200 hover:text-accent-100">
                  <VueIcon name="bs:box-arrow-up-right" />
                  Voir le profil
                </a>
                <p v-else class="text-sm text-foam-300/60 italic">Aucun lien ajouté.</p>
              </div>
              <div class="space-y-3">
                <p class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Commentaire</p>
                <p v-if="level.comment" class="text-sm text-white/80">{{ level.comment }}</p>
                <p v-else class="text-sm text-foam-300/60 italic">Pas de commentaire.</p>
              </div>
            </div>

            <template #footer>
              <div class="flex flex-wrap justify-end gap-2 border-t border-white/5 p-4">
                <Button variant="ghost" class="gap-2" @click="editingLevelId = level.id">
                  <VueIcon name="bs:pencil" /> Modifier
                </Button>
                <Button variant="danger" class="gap-2" size="sm" @click="handleDelete(level.id)">
                  <VueIcon name="bs:trash" /> Supprimer
                </Button>
              </div>
            </template>
          </Card>
        </template>
        <template v-else>
          <LevelForm :level="level" @cancel="handleEditCancel" @save="handleEditSave" />
        </template>
      </template>
    </ListView>
  </section>
</template>

<style scoped>
:deep(.card) {
  transition: all 0.3s ease;
}

:deep(.card):hover {
  transform: translateY(-2px);
}
</style>