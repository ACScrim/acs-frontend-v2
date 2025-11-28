<script setup lang="ts">
import { Avatar, Card } from '@/components/ui';
import type { UserWithStats } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { formatDate } from '@vueuse/core';

const props = defineProps<{
  user: UserWithStats;
}>();

const statsBlocks= [
  {
    id: '1',
    icon: 'lu:calendar-days',
    label: 'Membre',
    value: formatDate(new Date(props.user.createdAt), 'DD MMMM YYYY'),
    footer: 'Depuis',
    colorClass: 'text-christmas-gold',
  },
  {
    id: '2',
    icon: 'bs:lightning-fill',
    label: 'Activité',
    value: formatDate(new Date(props.user.lastActivity), 'DD MMMM YYYY'),
    footer: 'Dernière fois',
    colorClass: 'text-christmas-crimson',
  },
  {
    id: '3',
    icon: 'cd:target',
    label: 'Participation',
    value: props.user.tournamentStats.tournamentsCount,
    footer: 'Tournois joués',
    colorClass: 'text-christmas-forest',
  },
]
</script>

<template>
  <Card class="glass-panel p-8 space-y-8">
    <div class="flex flex-col items-center gap-4 text-center">
      <Avatar :src="user.avatarUrl" :alt="`Avatar de ${user.username}`" :size="40" class="shadow-[var(--shadow-soft)]" />
      <div>
        <p class="text-xs uppercase tracking-[0.4em] text-foam-300/80">Profil joueur</p>
        <h1 class="hero-title">{{ user.username }}</h1>
      </div>
    </div>
    <div class="grid gap-4 md:grid-cols-3">
      <Card v-for="item in statsBlocks" :key="item.id" class="glass-panel bg-white/5 border-white/5 p-4 text-center">
        <template #header>
          <div class="flex items-center justify-center gap-2 text-sm font-semibold text-accent-200">
            <VueIcon :name="item.icon" />
            <span class="uppercase tracking-[0.3em] text-foam-200/70">{{ item.label }}</span>
          </div>
        </template>
        <p class="text-2xl font-semibold text-white">{{ item.value }}</p>
        <template #footer>
          <p class="text-xs uppercase tracking-[0.3em] text-foam-300/70">{{ item.footer }}</p>
        </template>
      </Card>
    </div>
  </Card>
</template>