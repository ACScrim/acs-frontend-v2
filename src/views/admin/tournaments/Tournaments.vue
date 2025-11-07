<script setup lang="ts">
import TableTanstack from '@/components/global/TableTanstack.vue';
import { Button } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { getCoreRowModel, getPaginationRowModel, useVueTable } from '@tanstack/vue-table';
import { formatDate } from '@vueuse/core';
import { computed, h, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

const adminStore = useAdminStore();
const tournaments = computed(() => adminStore.tournaments);

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
});

const table = useVueTable({
  get data() {
    return tournaments.value;
  },
  columns: [
    { 
      header: 'Tournoi', 
      accessorKey: 'name',
      cell: ({ row }) => {
        return h('div', { class: 'flex items-center gap-2' }, [
          h('div', [
            h('p', { class: 'font-semibold text-christmas-ice' }, row.original.name),
            h('p', { class: 'text-xs text-christmas-gold-light/70' }, `ID: ${row.original.id}`)
          ])
        ]);
      }
    },
    { 
      header: 'Joueurs', 
      accessorKey: 'players.length',
      cell: ({ row }) => {
        const count = row.original.players?.length || 0;
        const cap = row.original.playerCap;
        return h('div', { class: 'flex items-center gap-2' }, [
          h('span', { class: 'font-semibold text-christmas-gold' }, cap > 0 ? `${count} / ${cap}` : count)
        ]);
      }
    },
    {
      header: 'Équipes publiées ?',
      accessorKey: 'teamsPublished',
      cell: ({ row }) => {
        const published = row.original.teamsPublished;
        return h('div', { class: 'flex items-center gap-2' }, [
          published 
            ? h(VueIcon, { name: 'bs:check-circle-fill', class: 'text-green-500' }) 
            : h(VueIcon, { name: 'bs:x-circle-fill', class: 'text-red-500' }),
          h('span', { class: published ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold' }, published ? 'Oui' : 'Non')
        ]);
      }
    },
    { 
      header: 'Date', 
      accessorKey: 'date',
      cell: ({ row }) => {
        return h('div', { class: 'flex items-center gap-2 text-christmas-gold-light' }, [
          h(VueIcon, { name: 'bs:calendar2-event', class: 'text-christmas-gold' }),
          formatDate(new Date(row.original.date), 'DD/MM/YYYY HH:mm')
        ]);
      }
    },
    { 
      header: 'Actions', 
      cell: ({ row }) => {
        return h('div', { class: 'flex gap-2' }, [
          h(RouterLink, { 
            to: { name: 'tournament-details', params: { id: row.original.id } },
            class: 'inline-block'
          }, {
            default: () => h(Button, {
              class: 'bg-gradient-to-r from-christmas-gold to-christmas-gold-light text-christmas-navy font-bold hover:shadow-lg hover:shadow-christmas-gold/40 transition-all duration-300 hover:scale-105'
            }, {
              default: () => [
                h(VueIcon, { name: 'bs:pencil-square', class: 'mr-2' }),
                'Modifier'
              ]
            })
          })
        ]);
      }
    }
  ],
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  state: {
    get pagination() {
      return pagination.value;
    }
  },
  onPaginationChange: (updater) => {
    pagination.value = typeof updater === 'function' ? updater(pagination.value) : updater;
  }
});

onMounted(() => {
  adminStore.fetchTournaments();
  adminStore.fetchPlayerLevels();
});
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="space-y-3 animate-fade-in">
      <div class="flex items-center gap-4">
        <div class="p-4 bg-gradient-to-br from-christmas-gold to-christmas-gold-light rounded-xl shadow-lg shadow-christmas-gold/20">
          <VueIcon name="bs:trophy-fill" class="text-2xl text-christmas-navy" />
        </div>
        <div>
          <h1 class="text-4xl font-black bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-crimson bg-clip-text text-transparent uppercase tracking-wider">
            Gestion des tournois
          </h1>
          <p class="text-christmas-gold-light flex items-center gap-2 mt-1">
            <span class="w-2 h-2 bg-christmas-gold rounded-full animate-pulse"></span>
            {{ tournaments.length }} tournoi(s) actif(s)
          </p>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <div class="w-1 h-6 bg-gradient-to-b from-christmas-gold to-christmas-crimson rounded-full"></div>
        <h2 class="text-xl font-bold text-christmas-ice uppercase tracking-wide">Liste des tournois</h2>
      </div>
      
      <TableTanstack :table="table" :paginated="true" />
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}
</style>