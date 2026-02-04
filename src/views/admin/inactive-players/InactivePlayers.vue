<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import useAdminStore from '@/stores/adminStore';
import { Button, Card, Badge } from '@/components/ui';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import type { InactivePlayerList } from '@/types/models';

const adminStore = useAdminStore();

const selectedList = ref<InactivePlayerList | null>(null);
const messageContent = ref('');
const inactivityMonths = ref(3);
const batchSize = ref(5);
const isAnalyzing = ref(false);
const isSending = ref(false);
const filterStatus = ref<'all' | 'pending' | 'sent' | 'archived'>('all');

onMounted(async () => {
  await adminStore.fetchInactivePlayerLists();
  await adminStore.fetchUsers();
});

const filteredLists = computed(() => {
  if (filterStatus.value === 'all') {
    return adminStore.inactivePlayerLists;
  }
  return adminStore.inactivePlayerLists.filter(list => list.status === filterStatus.value);
});

const analyzeInactivePlayers = async () => {
  isAnalyzing.value = true;
  try {
    await adminStore.analyzeInactivePlayers(inactivityMonths.value, batchSize.value);
  } finally {
    isAnalyzing.value = false;
  }
};

const selectList = (list: InactivePlayerList) => {
  selectedList.value = list;
  // Utiliser le messageContent de la liste, ou le message par défaut
  messageContent.value = list.messageContent || defaultMessage;
};

const removeUser = async (userId: string) => {
  if (!selectedList.value) return;
  await adminStore.removeUserFromList(selectedList.value.id, userId);
  selectedList.value = adminStore.inactivePlayerLists.find(l => l.id === selectedList.value!.id) || null;
};

const sendMessages = async () => {
  if (!selectedList.value || !messageContent.value.trim()) return;

  if (!confirm(`Êtes-vous sûr de vouloir envoyer ce message à ${selectedList.value.users.length} joueur(s) ?`)) {
    return;
  }

  isSending.value = true;
  try {
    await adminStore.sendMessagesToList(selectedList.value.id, messageContent.value);
    selectedList.value = adminStore.inactivePlayerLists.find(l => l.id === selectedList.value!.id) || null;
  } finally {
    isSending.value = false;
  }
};

const updateListStatus = async (status: 'pending' | 'sent' | 'archived') => {
  if (!selectedList.value) return;
  await adminStore.updateList(selectedList.value.id, { status });
  selectedList.value = adminStore.inactivePlayerLists.find(l => l.id === selectedList.value!.id) || null;
};

const deleteList = async (listId: string) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette liste ?')) {
    return;
  }

  await adminStore.deleteList(listId);
  if (selectedList.value?.id === listId) {
    selectedList.value = null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
    case 'sent': return 'bg-green-500/20 text-green-300 border-green-500/40';
    case 'archived': return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
    default: return 'bg-white/10 text-white border-white/20';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'En attente';
    case 'sent': return 'Envoyé';
    case 'archived': return 'Archivé';
    default: return status;
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const defaultMessage = `Salut ! 👋

On a remarqué que ça fait un moment qu'on ne t'a pas vu sur nos tournois ACS. 😢

On espère que tout va bien de ton côté ! Si tu as un peu de temps, on serait ravis de te revoir participer à nos prochains événements. L'ambiance est toujours au rendez-vous et on a plein de nouveaux tournois en préparation ! 🎮

N'hésite pas si tu as des questions ou des suggestions.

À très bientôt sur le serveur ! 🚀

L'équipe ACS`;

const resetToDefaultMessage = () => {
  messageContent.value = defaultMessage;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="space-y-2">
      <h1 class="text-3xl font-bold text-white">Joueurs inactifs</h1>
      <p class="text-white/60">Gérez les listes de joueurs n'ayant pas participé à des tournois récemment</p>
    </div>

    <!-- Analyse Section -->
    <Card class="glass-panel p-6 space-y-4">
      <div class="flex items-center gap-3 text-white">
        <VueIcon name="bs:search" class="text-xl" />
        <h2 class="text-xl font-semibold">Analyser les joueurs inactifs</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm text-white/70 mb-2">Inactivité (mois)</label>
          <input
            v-model.number="inactivityMonths"
            type="number"
            min="1"
            max="12"
            class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blush-500"
          />
        </div>

        <div>
          <label class="block text-sm text-white/70 mb-2">Taille des groupes</label>
          <input
            v-model.number="batchSize"
            type="number"
            min="1"
            max="20"
            class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blush-500"
          />
        </div>

        <div class="flex items-end">
          <Button
            @click="analyzeInactivePlayers"
            :disabled="isAnalyzing"
            class="w-full"
          >
            <VueIcon v-if="!isAnalyzing" name="bs:play-circle" class="mr-2" />
            <VueIcon v-else name="la:spinner-solid" class="mr-2 animate-spin" />
            {{ isAnalyzing ? 'Analyse en cours...' : 'Lancer l\'analyse' }}
          </Button>
        </div>
      </div>
    </Card>

    <!-- Filters -->
    <Card class="glass-panel p-4">
      <div class="flex items-center gap-3">
        <span class="text-white/70">Filtrer par statut :</span>
        <div class="flex gap-2">
          <Button
            @click="filterStatus = 'all'"
            :class="filterStatus === 'all' ? 'bg-blush-500' : 'bg-white/5'"
            size="sm"
          >
            Tous
          </Button>
          <Button
            @click="filterStatus = 'pending'"
            :class="filterStatus === 'pending' ? 'bg-blush-500' : 'bg-white/5'"
            size="sm"
          >
            En attente
          </Button>
          <Button
            @click="filterStatus = 'sent'"
            :class="filterStatus === 'sent' ? 'bg-blush-500' : 'bg-white/5'"
            size="sm"
          >
            Envoyés
          </Button>
          <Button
            @click="filterStatus = 'archived'"
            :class="filterStatus === 'archived' ? 'bg-blush-500' : 'bg-white/5'"
            size="sm"
          >
            Archivés
          </Button>
        </div>
      </div>
    </Card>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Lists -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-white flex items-center gap-2">
          <VueIcon name="bs:list-ul" />
          Listes ({{ filteredLists.length }})
        </h2>

        <div v-if="filteredLists.length === 0" class="text-center py-12">
          <VueIcon name="bs:inbox" class="text-6xl text-white/20 mx-auto mb-4" />
          <p class="text-white/50">Aucune liste disponible</p>
        </div>

        <Card
          v-for="list in filteredLists"
          :key="list.id"
          class="glass-panel p-4 cursor-pointer hover:border-blush-500 transition-colors"
          :class="selectedList?.id === list.id ? 'border-blush-500' : ''"
          @click="selectList(list)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-white font-medium">{{ list.name }}</h3>
              <div class="flex items-center gap-4 mt-2 text-sm text-white/60">
                <span class="flex items-center gap-1">
                  <VueIcon name="bs:people" />
                  {{ list.users.length }} joueur(s)
                </span>
                <span class="flex items-center gap-1">
                  <VueIcon name="bs:calendar" />
                  {{ formatDate(list.createdAt) }}
                </span>
              </div>
            </div>
            <div class="flex flex-col items-end gap-2">
              <Badge :class="getStatusColor(list.status)">
                {{ getStatusLabel(list.status) }}
              </Badge>
              <Button
                @click.stop="deleteList(list.id)"
                size="sm"
                variant="danger"
              >
                <VueIcon name="bs:trash" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <!-- List Details -->
      <div v-if="selectedList" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-white flex items-center gap-2">
            <VueIcon name="bs:eye" />
            Détails de la liste
          </h2>
          <div class="flex gap-2">
            <Button
              @click="updateListStatus('archived')"
              v-if="selectedList.status !== 'archived'"
              size="sm"
            >
              <VueIcon name="bs:archive" class="mr-1" />
              Archiver
            </Button>
            <Button
              @click="updateListStatus('pending')"
              v-if="selectedList.status === 'archived'"
              size="sm"
            >
              <VueIcon name="bs:arrow-counterclockwise" class="mr-1" />
              Réactiver
            </Button>
          </div>
        </div>

        <!-- Users List -->
        <Card class="glass-panel p-4">
          <h3 class="text-white font-medium mb-3 flex items-center gap-2">
            <VueIcon name="bs:people" />
            Joueurs ({{ selectedList.users.length }})
          </h3>

          <div class="space-y-2 max-h-[400px] overflow-y-auto">
            <div
              v-for="user in selectedList.users"
              :key="user.userId"
              class="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <div>
                <p class="text-white">{{ user.username }}</p>
                <p v-if="user.lastTournamentDate" class="text-xs text-white/50">
                  Dernier tournoi : {{ formatDate(user.lastTournamentDate) }}
                </p>
                <p v-else class="text-xs text-white/50">Jamais participé</p>
                <Badge v-if="user.messageSent" class="mt-1 bg-green-500/20 text-green-300 border-green-500/40">
                  Message envoyé
                </Badge>
              </div>
              <Button
                @click="removeUser(user.userId)"
                size="sm"
                variant="danger"
              >
                <VueIcon name="bs:x" />
              </Button>
            </div>
          </div>
        </Card>

        <!-- Message Section -->
        <Card class="glass-panel p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-white font-medium flex items-center gap-2">
              <VueIcon name="bs:chat-dots" />
              Message à envoyer
            </h3>
            <Button
              @click="resetToDefaultMessage"
              size="sm"
              variant="ghost"
              :disabled="selectedList.status === 'sent'"
              class="text-xs"
            >
              <VueIcon name="bs:arrow-counterclockwise" class="mr-1" />
              Message par défaut
            </Button>
          </div>

          <textarea
            v-model="messageContent"
            rows="8"
            placeholder="Rédigez votre message ici..."
            class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blush-500 resize-none"
            :disabled="selectedList.status === 'sent'"
          ></textarea>

          <div class="mt-4 flex gap-2">
            <Button
              @click="sendMessages"
              :disabled="!messageContent.trim() || isSending || selectedList.status === 'sent'"
              class="flex-1"
            >
              <VueIcon v-if="!isSending" name="bs:send" class="mr-2" />
              <VueIcon v-else name="la:spinner-solid" class="mr-2 animate-spin" />
              {{ isSending ? 'Envoi en cours...' : 'Envoyer les messages' }}
            </Button>
          </div>

          <p class="text-xs text-white/50 mt-2">
            <VueIcon name="bs:info-circle" class="inline mr-1" />
            Un délai de 1 seconde est appliqué entre chaque message pour respecter les limites Discord
          </p>
        </Card>
      </div>

      <div v-else class="flex items-center justify-center">
        <div class="text-center text-white/50">
          <VueIcon name="bs:hand-index" class="text-6xl mb-4 mx-auto" />
          <p>Sélectionnez une liste pour voir les détails</p>
        </div>
      </div>
    </div>
  </div>
</template>
