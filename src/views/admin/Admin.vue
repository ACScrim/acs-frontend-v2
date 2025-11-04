<script setup lang="ts">
import { Card, Badge } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { formatDate } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';

const adminStore = useAdminStore();
const filter = ref<'all' | 'info' | 'error'>('all');

onMounted(() => {
  const eventSource = new EventSource('http://localhost:5000/api/admin/logs');
  eventSource.onmessage = (event) => {
    adminStore.addLog(event.data);
  };
});

const filteredLogs = computed(() => {
  const sorted = adminStore.logs.sort((a, b) => b.time - a.time);
  if (filter.value === 'all') return sorted;
  if (filter.value === 'info') return sorted.filter(log => log.level === 30);
  return sorted.filter(log => log.level === 50 || log.statusCode >= 400);
});

const getStatusColor = (statusCode?: number) => {
  if (!statusCode) return 'text-christmas-gold';
  if (statusCode < 300) return 'text-christmas-green';
  if (statusCode < 400) return 'text-christmas-gold';
  if (statusCode < 500) return 'text-christmas-crimson';
  return 'text-christmas-red';
};

const getStatusBgColor = (statusCode?: number) => {
  if (!statusCode) return 'bg-christmas-gold/10 border-christmas-gold';
  if (statusCode < 300) return 'bg-christmas-green/10 border-christmas-green';
  if (statusCode < 400) return 'bg-christmas-gold/10 border-christmas-gold';
  if (statusCode < 500) return 'bg-christmas-crimson/10 border-christmas-crimson';
  return 'bg-christmas-red/10 border-christmas-red';
};

const getLogLevel = (level?: number) => {
  return level === 30 ? 'INFO' : 'ERROR';
};

const getLogIcon = (level?: number) => {
  return level === 30 ? 'bs:info-circle' : 'bs:exclamation-circle';
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="space-y-2">
      <h1 class="text-4xl font-bold bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-gold bg-clip-text text-transparent uppercase">
        Journaux d'administration
      </h1>
      <p class="text-christmas-gold-light">Suivi en temps réel des événements du serveur</p>
    </div>

    <!-- Controls -->
    <Card class="p-6 bg-christmas-navy/50 border-2 border-christmas-gold/30">
      <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-christmas-gold font-semibold flex items-center gap-2">
            <VueIcon name="bs:funnel" />
            Filtrer par type :
          </span>
          <div class="flex gap-2">
            <button
              v-for="type in ['all', 'info', 'error']"
              :key="type"
              @click="filter = type as any"
              :class="[
                'px-4 py-2 rounded-lg border-2 font-semibold transition-all duration-200 capitalize',
                filter === type
                  ? 'bg-christmas-gold text-christmas-navy border-christmas-gold'
                  : 'bg-transparent border-christmas-gold/30 text-christmas-gold hover:border-christmas-gold'
              ]"
            >
              {{ type }}
            </button>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 mt-4 text-christmas-gold-light">
        <VueIcon name="bs:clock-history" />
        <span class="text-sm">{{ filteredLogs.length }} journaux</span>
      </div>
    </Card>

    <!-- Logs Container -->
    <div
      id="logs-container"
      class="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2"
      style="scrollbar-width: thin; scrollbar-color: var(--color-christmas-gold) transparent;"
    >
      <template v-if="filteredLogs.length > 0">
        <Card
          v-for="(log, index) in filteredLogs"
          :key="index"
          class="p-4 border-l-4 transition-all duration-200 hover:shadow-lg hover:shadow-christmas-gold/20"
          :class="[
            getStatusBgColor(log.statusCode),
            log.level === 30 ? 'border-l-christmas-gold' : 'border-l-christmas-red'
          ]"
        >
          <!-- Header -->
          <div class="flex items-start justify-between gap-4 mb-3">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <VueIcon
                :name="getLogIcon(log.level)"
                :class="['text-xl flex-shrink-0', getStatusColor(log.statusCode)]"
              />
              <div class="min-w-0 flex-1">
                <div v-if="log.method && log.statusCode" class="flex items-center gap-2 flex-wrap">
                  <Badge :class="getStatusBgColor(log.statusCode)">
                    <span :class="getStatusColor(log.statusCode)" class="font-bold">
                      {{ log.method }}
                    </span>
                  </Badge>
                  <span :class="getStatusColor(log.statusCode)" class="font-bold text-lg">
                    {{ log.statusCode }}
                  </span>
                  <span class="text-christmas-ice text-sm font-mono truncate">
                    {{ log.url }}
                  </span>
                </div>
                <div v-else class="flex items-center gap-2">
                  <Badge :class="getStatusBgColor(log.statusCode)">
                    <span :class="getStatusColor(log.statusCode)" class="font-bold uppercase text-xs">
                      {{ getLogLevel(log.level) }}
                    </span>
                  </Badge>
                </div>
              </div>
            </div>

            <!-- Timestamp -->
            <div class="text-right flex-shrink-0">
              <p class="text-xs text-christmas-gold-light">
                {{ formatDate(new Date(log.time), 'HH:mm:ss') }}
              </p>
              <p class="text-xs text-christmas-gold-light/60">
                {{ formatDate(new Date(log.time), 'DD/MM') }}
              </p>
            </div>
          </div>

          <!-- Content -->
          <div class="space-y-2 bg-christmas-midnight/30 rounded p-3 font-mono text-sm text-christmas-ice">
            <pre v-if="log.msg" class="whitespace-pre-wrap break-words overflow-x-auto">{{ log.msg }}</pre>
            <pre v-if="log.body" class="whitespace-pre-wrap break-words overflow-x-auto text-christmas-gold-light/70">{{ log.body }}</pre>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-christmas-gold/10 text-xs text-christmas-gold-light">
            <span class="flex items-center gap-2">
              <VueIcon name="bs:person-circle" />
              {{ log.user || 'Système' }}
            </span>
            <span class="italic">{{ formatDate(new Date(log.time), '[Le] DD/MM/YYYY [à] HH:mm:ss') }}</span>
          </div>
        </Card>
      </template>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-16 text-center">
        <VueIcon name="bs:inbox" class="text-6xl text-christmas-gold/30 mb-4" />
        <p class="text-christmas-gold-light">Aucun journal ne correspond à vos filtres</p>
        <p class="text-christmas-gold-light/50 text-sm">Les journaux apparaîtront ici en temps réel</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scrollbar personnalisée */
#logs-container::-webkit-scrollbar {
  width: 8px;
}

#logs-container::-webkit-scrollbar-track {
  background: transparent;
}

#logs-container::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, var(--color-christmas-gold), var(--color-christmas-red));
  border-radius: 4px;
}

#logs-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, var(--color-christmas-gold-light), var(--color-christmas-crimson));
}
</style>