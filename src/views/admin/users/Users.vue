<script setup lang="ts">
import Modal from '@/components/global/Modal.vue';
import TableTanstack from '@/components/global/TableTanstack.vue';
import { Avatar, Badge } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { getCoreRowModel, getPaginationRowModel, useVueTable } from '@tanstack/vue-table';
import { formatDate } from '@vueuse/core';
import { computed, h, onMounted, ref } from 'vue';

const adminStore = useAdminStore();
const users = computed(() => adminStore.users);

const reportModalUserId = ref<string | null>(null);
const isReportsModalOpen = computed(() => reportModalUserId.value !== null);

const newReportModalUserId = ref<string | null>(null);
const isNewReportModalOpen = computed(() => newReportModalUserId.value !== null);

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
});

const table = useVueTable({
  get data() {
    return users.value;
  },
  columns: [
    {
      header: 'Avatar',
      accessorKey: 'avatarUrl',
      cell: ({ cell, row }) => {
        return h('div', { class: 'flex justify-center' },
          h(Avatar, {
            src: cell.getValue(),
            alt: 'Avatar',
            class: 'overflow-hidden w-12 h-12 border-2 border-christmas-gold/50 hover:border-christmas-gold transition-all duration-300 hover:scale-110',
            fallback: row.original.username[0]
          })
        );
      }
    },
    {
      header: 'Utilisateur',
      accessorKey: 'username',
      cell: ({ row }) => {
        return h('div', { class: 'flex items-center gap-3 py-2' }, [
          h('div', [
            h('p', { class: 'font-semibold text-christmas-ice hover:text-christmas-gold transition-colors' }, row.original.username),
            h('p', { class: 'text-xs text-christmas-gold-light/70 font-mono' }, `#${row.original.discordId || 'N/A'}`)
          ])
        ]);
      }
    },
    {
      header: 'Rôle',
      accessorKey: 'role',
      cell: ({ cell }) => {
        const role = cell.getValue() as string;
        const roleConfig: Record<string, { color: string; icon: string }> = {
          'admin': { color: 'bg-christmas-red/20 border-christmas-red text-christmas-red', icon: 'bs:shield-fill' },
          'superadmin': { color: 'bg-christmas-gold/20 border-christmas-gold text-christmas-gold', icon: 'bs:shield-fill' },
          'user': { color: 'bg-christmas-forest/20 border-christmas-forest text-christmas-forest', icon: 'bs:person-fill' }
        };
        const config = roleConfig[role.toLowerCase()] || { color: 'bg-christmas-gold/10 border-christmas-gold text-christmas-gold', icon: 'bs:person' };
        
        return h('div', { class: 'flex items-center gap-2' }, [
          h(VueIcon, { name: config.icon, class: 'text-lg' }),
          h(Badge, {
            class: `border-2 font-semibold ${config.color}`
          }, { default: () => role.toUpperCase() })
        ]);
      }
    },
    {
      header: 'Reports',
      accessorKey: 'reports.length',
      cell: ({ row }) => {
        const reportsCount = row.original.reports?.length || 0;
        const hasReports = reportsCount > 0;
        
        return h('div', { class: 'flex items-center justify-center gap-2' }, [
          h('div', {
            class: `px-3 py-1 rounded-full font-bold transition-all duration-300 ${
              hasReports 
                ? 'bg-christmas-red/20 text-christmas-red border border-christmas-red/50' 
                : 'bg-christmas-green/20 text-christmas-green border border-christmas-green/50'
            }`
          }, reportsCount),
          h('div', { class: 'flex gap-1' }, [
            h('button', {
              class: 'p-2 hover:bg-christmas-gold/30 rounded-lg transition-all duration-300 text-christmas-gold hover:text-christmas-gold-light hover:scale-110 group relative',
              title: 'Voir les reports',
              onClick: () => openReportsModal(row.original.id),
            }, [
              h(VueIcon, { name: 'bs:eye', class: 'text-lg' }),
            ]),
            h('button', {
              class: 'p-2 hover:bg-christmas-gold/30 rounded-lg transition-all duration-300 text-christmas-gold hover:text-christmas-gold-light hover:scale-110 group relative',
              title: 'Ajouter un report',
              onClick: () => openNewReportModal(row.original.id),
            },
              [
                h(VueIcon, { name: 'bs:plus-lg', class: 'text-lg' }),
                h('span', { class: 'absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-christmas-navy border border-christmas-gold/50 rounded px-2 py-1 text-xs text-christmas-gold-light opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap' }, 'Ajouter')
              ]
            )
          ])
        ]);
      }
    },
    {
      header: 'Rejoint le',
      accessorKey: 'createdAt',
      cell: ({ cell }) => {
        return h('div', { class: 'text-sm text-christmas-gold-light flex items-center gap-2' }, [
          h(VueIcon, { name: 'bs:calendar2-check', class: 'text-christmas-gold' }),
          formatDate(new Date(cell.getValue() as string), 'DD/MM/YYYY')
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

const openReportsModal = (userId: string) => {
  reportModalUserId.value = userId;
}

const openNewReportModal = (userId: string) => {
  newReportModalUserId.value = userId;
}

onMounted(() => {
  adminStore.fetchUsers();
});
</script>

<template>
  <div class="space-y-8">
    <!-- Animated Header -->
    <div class="space-y-3 animate-fade-in">
      <div class="flex items-center gap-4">
        <div class="p-4 bg-gradient-to-br from-christmas-gold to-christmas-gold-light rounded-xl shadow-lg shadow-christmas-gold/20">
          <VueIcon name="bs:people-fill" class="text-2xl text-christmas-navy" />
        </div>
        <div>
          <h1 class="text-4xl font-black bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-crimson bg-clip-text text-transparent uppercase tracking-wider">
            Gestion des utilisateurs
          </h1>
          <p class="text-christmas-gold-light flex items-center gap-2 mt-1">
            <span class="w-2 h-2 bg-christmas-gold rounded-full animate-pulse"></span>
            {{ users.length }} utilisateur(s) en ligne
          </p>
        </div>
      </div>
    </div>

    <!-- Table Container -->
    <div class="space-y-4 animate-fade-in">
      <div class="flex items-center gap-2">
        <div class="w-1 h-6 bg-gradient-to-b from-christmas-gold to-christmas-crimson rounded-full"></div>
        <h2 class="text-xl font-bold text-christmas-ice uppercase tracking-wide">Liste des utilisateurs</h2>
      </div>
      
      <TableTanstack :table="table" :paginated="true" />
    </div>

    <!-- Modal for reports -->
    <Modal :isOpen="isReportsModalOpen" @close="reportModalUserId = null">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-christmas-red/20 rounded-lg">
            <VueIcon name="bs:exclamation-triangle-fill" class="text-2xl text-christmas-red" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-christmas-ice">Reports</h2>
            <p class="text-xs text-christmas-gold-light mt-1">{{ users.find(u => u.id === reportModalUserId)?.reports?.length || 0 }} report(s)</p>
          </div>
        </div>
      </template>
      <template #default>
        <div v-if="reportModalUserId" class="space-y-3 max-h-96 overflow-y-auto pr-2">
          <div v-for="(report, index) in users.find(user => user.id === reportModalUserId)?.reports || []" :key="report.id" 
            class="p-4 border-l-4 border-l-christmas-red bg-gradient-to-r from-christmas-red/10 to-transparent rounded-lg hover:from-christmas-red/20 transition-all duration-300 animate-slide-in"
            :style="{ animationDelay: `${index * 50}ms` }">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 space-y-3">
                <div class="flex items-center gap-2">
                  <VueIcon name="bs:hash" class="text-christmas-gold" />
                  <span class="font-mono text-sm text-christmas-gold-light">{{ report.id.slice(0, 8) }}...</span>
                </div>
                <div>
                  <p class="text-xs text-christmas-gold-light/70 uppercase tracking-wide mb-1">Raison</p>
                  <p class="text-christmas-ice">{{ report.reason }}</p>
                </div>
                <p class="text-christmas-gold-light/70 text-sm flex items-center gap-2">
                  <VueIcon name="bs:calendar" />
                  {{ formatDate(new Date(report.createdAt), 'DD/MM/YYYY [à] HH:mm') }}
                </p>
              </div>
              <button 
                @click="adminStore.removeReport(report.id, reportModalUserId)" 
                class="px-3 py-2 bg-christmas-red/20 text-christmas-red border-2 border-christmas-red/50 rounded-lg hover:bg-christmas-red/40 hover:border-christmas-red transition-all duration-300 text-sm font-semibold flex-shrink-0 hover:scale-105 flex items-center gap-2 group"
              >
                <VueIcon name="bs:trash3" class="group-hover:scale-110 transition-transform" />
                <span class="hidden sm:inline">Supprimer</span>
              </button>
            </div>
          </div>
          <div v-if="(users.find(user => user.id === reportModalUserId)?.reports || []).length === 0" class="flex flex-col items-center justify-center py-16 text-center">
            <div class="p-4 bg-christmas-green/10 rounded-full mb-4">
              <VueIcon name="bs:check-circle-fill" class="text-5xl text-christmas-green" />
            </div>
            <p class="text-christmas-ice font-semibold">Aucun report</p>
            <p class="text-christmas-gold-light/50 text-sm">Excellent comportement ! 🎄</p>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Modal for new report -->
    <Modal :is-open="isNewReportModalOpen" @close="newReportModalUserId = null">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-christmas-gold/20 rounded-lg">
            <VueIcon name="bs:plus-circle-fill" class="text-2xl text-christmas-gold" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-christmas-ice">Créer un report</h2>
            <p class="text-xs text-christmas-gold-light mt-1">Signaler un comportement</p>
          </div>
        </div>
      </template>
      <template #default>
        <div v-if="newReportModalUserId">
          <form @submit.prevent="(e: any) => { adminStore.addReportToUser(newReportModalUserId!, e.target?.reason.value); newReportModalUserId = null; }">
            <div class="mb-6">
              <label for="reason" class="text-sm font-semibold text-christmas-gold mb-3 flex items-center gap-2 uppercase tracking-wide">
                <VueIcon name="bs:pencil-square" />
                Raison du report
              </label>
              <textarea 
                id="reason" 
                required
                class="w-full border-2 border-christmas-gold/30 hover:border-christmas-gold/50 focus:border-christmas-gold bg-christmas-navy/50 rounded-lg shadow-md p-4 text-christmas-ice placeholder-christmas-gold-light/40 focus:outline-none focus:ring-2 focus:ring-christmas-gold/30 transition-all resize-none" 
                rows="5" 
                placeholder="Décrivez précisément la raison du report..."
              ></textarea>
            </div>
            <div class="flex justify-end gap-3">
              <button 
                type="button" 
                @click="newReportModalUserId = null" 
                class="px-4 py-2 border-2 border-christmas-gold/30 text-christmas-gold-light rounded-lg hover:border-christmas-gold hover:bg-christmas-gold/10 transition-all duration-300 font-semibold hover:scale-105"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                class="px-4 py-2 bg-gradient-to-r from-christmas-gold to-christmas-gold-light text-christmas-navy font-bold rounded-lg hover:shadow-lg hover:shadow-christmas-gold/40 transition-all duration-300 flex items-center gap-2 hover:scale-105 hover:-translate-y-1"
              >
                <VueIcon name="bs:check-lg" />
                Envoyer
              </button>
            </div>
          </form>
        </div>
      </template>
    </Modal>
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

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.animate-slide-in {
  animation: slide-in 0.4s ease-out forwards;
}
</style>