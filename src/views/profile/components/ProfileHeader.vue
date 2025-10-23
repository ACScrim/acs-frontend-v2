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
  <Card class="p-6 bg-christmas-navy/80" style="--tw-border-color: var(--color-christmas-ice); --tw-border-opacity: 0.5;">
    <div class="flex flex-col gap-4 items-center justify-start">
      <div class="flex flex-col items-center justify-center gap-2">
        <Avatar
          :src="user.avatarUrl"
          :alt="`Avatar de ${user.username}`"
          :size="32"
        />
        <h2 class="text-2xl font-bold">{{ user.username }}</h2>
      </div>
      <div class="flex flex-row flex-wrap gap-4 items-center justify-center">
        <Card class="px-12 py-6 border-transparent bg-christmas-ice/10 shadow-sm shadow-christmas-gold w-full sm:w-auto" v-for="item in statsBlocks" :key="item.id">
          <template #header>
            <div class="flex items-center gap-2 justify-center text-xl font-bold" :class="item.colorClass">
              <VueIcon :name="item.icon" />
              <span class="text-xl">{{ item.label }}</span>
            </div>
          </template>
          <span class="font-bold text-2xl block place-self-center text-center truncate">
            {{ item.value }}
          </span>
          <template #footer>
            <span class="uppercase text-xl font-bold place-self-center block truncate" :class="item.colorClass">{{ item.footer }}</span>
          </template>
        </Card>
      </div>
    </div>
  </Card>
</template>