<script setup lang="ts">
import ListView from '@/components/global/ListView.vue';
import { Button, Card } from '@/components/ui';
import usePlayerLevelStore from '@/stores/playerLevelStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { onMounted, ref } from 'vue';
import LevelForm from './components/LevelForm.vue';

const playerLevelStore = usePlayerLevelStore();
const editingLevelId = ref<string | null>(null);

onMounted(() => {
  playerLevelStore.fetchPlayerGameLevels();
});

const getLevelConfig = (level: string) => {
  const configs: Record<string, { color: string; bgColor: string; icon: string }> = {
    'débutant': { color: 'text-green-400', bgColor: 'bg-green-500/20', icon: 'bs:mortarboard' },
    'intermédiaire': { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', icon: 'bs:lightning-fill' },
    'avancé': { color: 'text-orange-400', bgColor: 'bg-orange-500/20', icon: 'bs:fire' },
    'expert': { color: 'text-red-400', bgColor: 'bg-red-500/20', icon: 'bs:crown-fill' }
  };
  return configs[level.toLowerCase()] || configs['débutant'] as { color: string; bgColor: string; icon: string };
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
</script>

<template>
  <div class="w-full">
    <h1 class="text-3xl font-bold text-christmas-ice mb-2">Mes niveaux de jeu</h1>
    <p class="text-christmas-gold-light mb-6">Gérez vos niveaux et vos informations de jeu</p>

    <ListView
      :data="playerLevelStore.levels"
      title=""
      empty-message="Vous n'avez pas encore défini de niveaux de jeu. Allez à un tournoi pour en ajouter !"
    >
      <template #add-append>
        <LevelForm />
      </template>

      <template #item="{ item: level }">
        <!-- Mode affichage -->
        <template v-if="editingLevelId !== level.id">
          <Card class="border-christmas-gold border-2 overflow-hidden hover:shadow-lg hover:shadow-christmas-gold/30 transition-all duration-300">
            <!-- Header avec image -->
            <template #header>
              <div class="relative h-48 overflow-hidden">
                <img 
                  :src="level.game.imageUrl" 
                  :alt="`Bannière du jeu ${level.game.name}`"
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-christmas-navy to-transparent"></div>
                
                <!-- Infos en bas de l'image -->
                <div class="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                  <div>
                    <h3 class="text-xl font-bold text-christmas-snow">{{ level.game.name }}</h3>
                  </div>
                  <div 
                    :class="[
                      'px-3 py-1 rounded-lg font-bold flex items-center gap-2 border-2',
                      getLevelConfig(level.level).color,
                      getLevelConfig(level.level).bgColor,
                      'border-current'
                    ]"
                  >
                    <VueIcon :name="getLevelConfig(level.level).icon" />
                    <span>{{ level.level }}</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- Contenu principal - Affichage -->
            <template #default>
              <div class="space-y-4 p-4">
                <!-- Pseudo et rang -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="flex items-center gap-2">
                    <VueIcon name="ca:user-filled" class="text-christmas-gold text-xl" />
                    <div>
                      <p class="text-xs text-christmas-gold-light/70">Pseudo</p>
                      <p class="font-bold text-christmas-gold">{{ level.gameUsername }}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <VueIcon name="bs:star-fill" class="text-christmas-gold text-xl" />
                    <div>
                      <p class="text-xs text-christmas-gold-light/70">Rang</p>
                      <p class="font-bold" :class="level.rank ? 'text-christmas-gold' : 'text-christmas-gold-light/50'">
                        {{ level.rank || 'Non classé' }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Rôles si disponibles -->
                <div class="border-t border-christmas-gold/20 pt-4">
                  <p class="text-xs text-christmas-gold-light/70 mb-2">Rôles préférés</p>
                  <div class="flex flex-wrap gap-2" v-if="level.selectedRoles?.length">
                    <span 
                      v-for="role in level.selectedRoles" 
                      :key="role"
                      class="px-2 py-1 bg-christmas-gold/10 text-christmas-gold-light text-sm rounded border border-christmas-gold/30"
                    >
                      {{ role }}
                    </span>
                  </div>
                  <div v-else class="text-christmas-gold-light/50 text-sm italic">
                    Aucun rôle préféré défini.
                  </div>
                </div>

                <!-- Lien profil si disponible -->
                <div v-if="level.gameProfileLink" class="border-t border-christmas-gold/20 pt-4">
                  <p class="text-xs text-christmas-gold-light/70 mb-2 flex items-center gap-2">
                    <VueIcon name="bs:link-45deg" />
                    Lien profil
                  </p>
                  <a 
                    :href="level.gameProfileLink" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 text-christmas-gold hover:text-christmas-gold-light transition-colors break-all"
                  >
                    <VueIcon name="bs:box-arrow-up-right" class="text-sm flex-shrink-0" />
                    <span class="text-sm underline">Voir le profil</span>
                  </a>
                </div>

                <!-- Commentaire si disponible -->
                <div class="border-t border-christmas-gold/20 pt-4">
                  <p class="text-xs text-christmas-gold-light/70 mb-1">Commentaire</p>
                  <p v-if="level.comment" class="text-sm text-christmas-gold-light italic">{{ level.comment }}</p>
                  <p v-else class="text-christmas-gold-light/50 text-sm italic">Aucun commentaire ajouté.</p>
                </div>
              </div>
            </template>

            <!-- Boutons d'action -->
            <template #footer>
              <div class="flex gap-2 justify-end p-4 border-t border-christmas-gold/20">
                <Button 
                  class="flex items-center gap-2"
                  @click="editingLevelId = level.id"
                >
                  <VueIcon name="bs:pencil" />
                  Modifier
                </Button>
                <Button 
                  color="christmas-red"
                  class="flex items-center gap-2"
                  @click="handleDelete(level.id)"
                >
                  <VueIcon name="bs:trash" />
                  Supprimer
                </Button>
              </div>
            </template>
          </Card>
        </template>

        <!-- Mode édition -->
        <template v-else>
          <LevelForm :level="level" @cancel="handleEditCancel" @save="handleEditSave" />
        </template>
      </template>
    </ListView>
  </div>
</template>

<style scoped>
:deep(.card) {
  transition: all 0.3s ease;
}

:deep(.card):hover {
  transform: translateY(-2px);
}
</style>