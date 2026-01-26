<script setup lang="ts">
import { Button, Card, Badge } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { formatDate } from '@vueuse/core';
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue';

const adminStore = useAdminStore();
const filter = ref<'all' | 'info' | 'error'>('all');

const eventSource = ref<EventSource | null>(null);

onMounted(() => {
  adminStore.fetchLogsHistory();
  eventSource.value = new EventSource(`${import.meta.env.VITE_API_URL}/admin/logs`, { withCredentials: true });
});

onBeforeUnmount(() => {
  if (eventSource.value) {
    eventSource.value.close();
  }
});

watch(eventSource, (es) => {
  if (!es || es.readyState === EventSource.CLOSED || es.onmessage) return;

  es.onmessage = (event) => {
    const raw = event.data;
    // Adaptez le parsing selon votre format (JSON array ou NDJSON)
    const items: string[] = Array.isArray(raw)
        ? raw
        : typeof raw === 'string'
            ? raw.split('\n').filter(Boolean)
            : [raw];

    const batchSize = 50;
    let idx = 0;

    const pushBatch = () => {
      const end = Math.min(idx + batchSize, items.length);
      for (; idx < end; idx++) {
        if (idx && items[idx]) adminStore.addLog(items[idx] as string);
      }
      if (idx < items.length) {
        (window.requestIdleCallback ?? window.requestAnimationFrame)(pushBatch);
      }
    };

    if (items.length === 1) {
      if (items[0]) queueMicrotask(() => adminStore.addLog(items[0] as string));
    } else {
      (window.requestIdleCallback ?? window.requestAnimationFrame)(pushBatch);
    }
  };
});

const filteredLogs = computed(() => {
  const sorted = [...adminStore.logs].sort((a, b) => b.time - a.time);
  if (filter.value === 'all') return sorted;
  if (filter.value === 'info') return sorted.filter(log => log.level === 30);
  return sorted.filter(log => log.level === 50 || log.statusCode >= 400);
});

const statusVariants = {
  neutral: 'border-white/10 bg-white/5 text-white',
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  warning: 'border-amber-400/40 bg-amber-400/10 text-amber-100',
  danger: 'border-blush-500/40 bg-blush-500/10 text-blush-200'
};
const getStatusVariant = (statusCode?: number) => {
  if (!statusCode) return 'neutral';
  if (statusCode < 300) return 'success';
  if (statusCode < 400) return 'warning';
  return 'danger';
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
      <h1 class="hero-title">Journaux d'administration</h1>
      <p class="muted">Suivi en temps réel des événements du serveur</p>
    </div>

    <!-- Controls -->
    <Card class="glass-panel space-y-4 p-6 sticky top-5 z-10">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div class="flex items-center gap-3 text-white">
          <VueIcon name="bs:funnel" />
          Filtrer par type :
        </div>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="type in ['all','info','error']"
            :key="type"
            :variant="filter === type ? 'primary' : 'outline'"
            size="sm"
            @click="filter = type as any"
          >
            {{ type }}
          </Button>
        </div>
      </div>
      <p class="text-sm text-foam-300/80 flex items-center gap-2">
        <VueIcon name="bs:clock-history" /> {{ filteredLogs.length }} journaux
      </p>
    </Card>

    <!-- Logs Container -->
    <div
      class="space-y-3"
    >
      <template v-if="filteredLogs.length > 0">
        <Card
          v-for="(log, index) in filteredLogs"
          :key="index"
          class="border-l-4 p-4"
          :class="`border-l-${getStatusVariant(log.statusCode)}`"
        >
          <!-- Header -->
          <div class="mb-3 flex items-start justify-between gap-4">
            <div class="flex flex-1 items-center gap-3">
              <VueIcon :name="getLogIcon(log.level)" class="text-xl text-white" />
              <div class="flex-1 min-w-0">
                <div v-if="log.method && log.statusCode" class="flex flex-wrap items-center gap-2">
                  <Badge :tone="getStatusVariant(log.statusCode) as any">{{ log.method }}</Badge>
                  <span class="font-semibold" :class="statusVariants[getStatusVariant(log.statusCode)]">
                    {{ log.statusCode }}
                  </span>
                  <span class="text-sm text-foam-300/80 truncate">
                    {{ log.url }}
                  </span>
                </div>
                <div v-else class="text-sm text-foam-200/80">
                  {{ getLogLevel(log.level) }}
                </div>
              </div>
            </div>

            <!-- Timestamp -->
            <div class="text-right text-xs text-foam-300/70">
              <p>{{ formatDate(new Date(log.time), 'HH:mm:ss') }}</p>
              <p>{{ formatDate(new Date(log.time), 'DD/MM') }}</p>
            </div>
          </div>

          <!-- Content -->
          <div class="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-3 text-sm text-foam-100">
            <pre v-if="log.msg" class="whitespace-pre-wrap break-words">{{ log.msg }}</pre>
            <pre v-if="log.body" class="whitespace-pre-wrap break-words text-foam-200/80">{{ log.body }}</pre>
          </div>

          <!-- Footer -->
          <div class="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-xs text-foam-300/70">
            <span class="flex items-center gap-2">
              <VueIcon name="bs:person-circle" />
              {{ log.user || 'Système' }}
            </span>
            <span>{{ formatDate(new Date(log.time), '[Le] DD/MM/YYYY [à] HH:mm:ss') }}</span>
          </div>
        </Card>
      </template>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-16 text-center text-foam-300/70">
        <VueIcon name="bs:inbox" class="mb-4 text-5xl" />
        Aucun journal ne correspond à vos filtres
      </div>
    </div>
  </div>
</template>