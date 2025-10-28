<script setup lang="ts">
import Modal from '@/components/global/Modal.vue';
import TableTanstack from '@/components/global/TableTanstack.vue';
import { Avatar } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
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

const table = computed(() => useVueTable({
  data: users,
  columns: [
    {
      header: 'Avatar',
      accessorKey: 'avatarUrl',
      cell: ({ cell, row }) => {
        return h(Avatar, {
          src: cell.getValue(),
          alt: 'Avatar',
          class: 'overflow-hidden place-self-center',
          fallback: row.original.username[0]
        });
      }
    },
    {
      header: 'Nom d\'utilisateur',
      accessorKey: 'username',
    },
    {
      header: 'Rôle',
      accessorKey: 'role',
    },
    {
      header: 'Reports',
      accessorKey: 'reports.length',
      cell: ({ cell, row }) => {
        return h('div', {
          class: 'flex items-center justify-center gap-2'
          },
          [
            h('button', {
              class: 'underline underline-offset-2',
              onClick: () => {
                openReportsModal(row.original.id);
              },
            }, cell.getValue()),
            h('button', {
              class: 'text-2xl text-christmas-gold',
              onClick: () => {
                openNewReportModal(row.original.id);
              },
            }, '+')
          ]
        );
      }
    },
    {
      header: 'Discord ID',
      accessorKey: 'discordId'
    },
    {
      header: 'Rejoint le',
      accessorKey: 'createdAt',
      cell: ({ cell }) => formatDate(new Date(cell.getValue()), 'DD/MM/YYYY')
    }
  ],
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  rowCount: users.value.length,
  initialState: {
    pagination: pagination.value
  }
}));

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
  <div>
    <h1 class="text-3xl font-bold text-christmas-ice mb-6">Gestion des utilisateurs ({{ users.length }})</h1>
  </div>

  <TableTanstack :table="table" :paginated="true" />

    <!-- Modal for reports -->
  <Modal :isOpen="isReportsModalOpen" @close="reportModalUserId = null">
    <template #header>
      <h2 class="text-xl font-bold text-christmas-ice">Reports</h2>
    </template>
    <template #default>
      <div v-if="reportModalUserId">
        <div v-for="report in users.find(user => user.id === reportModalUserId)?.reports || []" :key="report.id" class="mb-4 p-4 border border-christmas-gold/30 rounded-lg bg-christmas-navy/50 hover:bg-christmas-navy/80 transition-colors">
          <p class="text-christmas-gold-light"><strong class="text-christmas-gold">Report ID:</strong> {{ report.id }}</p>
          <p class="text-christmas-gold-light mt-2"><strong class="text-christmas-gold">Reason:</strong> {{ report.reason }}</p>
          <p class="text-christmas-gold-light/70 text-sm mt-2"><strong class="text-christmas-gold">Date:</strong> {{ formatDate(new Date(report.createdAt), 'DD/MM/YYYY HH:mm') }}</p>
          <button @click="adminStore.removeReport(report.id, reportModalUserId)" class="mt-3 px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/50 rounded hover:bg-red-500/30 hover:border-red-500 transition-all text-sm">Supprimer</button>
        </div>
        <div v-if="(users.find(user => user.id === reportModalUserId)?.reports || []).length === 0" class="text-center py-8 text-christmas-gold-light/50">
          Aucun report pour cet utilisateur.
        </div>
      </div>
    </template>
  </Modal>

  <Modal :is-open="isNewReportModalOpen" @close="newReportModalUserId = null">
    <template #header>
      <h2 class="text-xl font-bold text-christmas-ice">Créer un nouveau report</h2>
    </template>
    <template #default>
      <div v-if="newReportModalUserId">
        <form @submit.prevent="(e: any) => { adminStore.addReportToUser(newReportModalUserId!, e.target?.reason.value); newReportModalUserId = null; }">
          <div class="mb-6">
            <label for="reason" class="block text-sm font-medium text-christmas-gold mb-2">Raison</label>
            <textarea id="reason" class="w-full border-2 border-christmas-gold/30 bg-christmas-navy rounded-lg shadow-sm p-3 text-christmas-ice placeholder-christmas-gold-light/50 focus:border-christmas-gold focus:outline-none focus:ring-2 focus:ring-christmas-gold/20 transition-all" rows="4" placeholder="Décrivez la raison du report..."></textarea>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="newReportModalUserId = null" class="px-4 py-2 border-2 border-christmas-gold/30 text-christmas-gold-light rounded-lg hover:border-christmas-gold hover:bg-christmas-gold/10 transition-all">Annuler</button>
            <button type="submit" class="px-4 py-2 bg-gradient-to-r from-christmas-gold to-christmas-gold-light text-christmas-navy font-bold rounded-lg hover:shadow-lg hover:shadow-christmas-gold/40 transition-all">Envoyer</button>
          </div>
        </form>
      </div>
    </template>
  </Modal>
</template>