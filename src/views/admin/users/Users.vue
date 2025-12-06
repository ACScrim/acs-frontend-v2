<script setup lang="ts">
import Modal from '@/components/global/Modal.vue';
import TableTanstack from '@/components/global/TableTanstack.vue';
import { Avatar, Badge, Button, Card } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import {getCoreRowModel, getPaginationRowModel, getSortedRowModel, useVueTable} from '@tanstack/vue-table';
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
      header: 'Utilisateur',
      accessorKey: 'username',
      cell: ({ row }) => h('div', { class: 'flex items-center gap-3 py-2' }, [
        h(Avatar, {
          src: row.original.avatarUrl,
          alt: row.original.username,
          class: 'rounded-full border border-white',
          fallback: row.original.username[0]?.toUpperCase(),
          size: 12
        }),
        h('div', [
          h('p', { class: 'font-semibold text-white' }, row.original.username),
          h('p', { class: 'text-xs text-foam-300/70 font-mono' }, `#${row.original.discordId || 'N/A'}`)
        ])
      ]),
      sortingFn: (rowA, rowB) => {
        return rowA.original.username.localeCompare(rowB.original.username);
      }
    },
    {
      header: 'Rôle',
      cell: ({ row }) => h('select', {
        value: row.original.role,
        onChange: (e: Event) => adminStore.updateUserRole(row.original.id, (e.target as HTMLSelectElement).value),
        class: 'w-full rounded-[var(--radius-lg)] border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-foam-300/60 focus:border-accent-300 focus:ring-2 focus:ring-accent-300/20 outline-none max-w-[160px] text-sm'
      }, [
        h('option', { value: 'user' }, 'User'),
        h('option', { value: 'admin' }, 'Admin'),
        h('option', { value: 'superadmin' }, 'Superadmin')
      ])
    },
    {
      header: 'Reports',
      cell: ({ row }) => {
        const reportsCount = row.original.reports?.length || 0;
        return h('div', { class: 'flex items-center gap-2' }, [
          h(Badge, { tone: reportsCount ? 'blush' : 'emerald' }, () => reportsCount.toString()),
          h(Button, { size: 'sm', variant: 'ghost', onClick: () => openReportsModal(row.original.id) }, () => h(VueIcon, { name: 'bs:eye' })),
          h(Button, { size: 'sm', variant: 'ghost', onClick: () => openNewReportModal(row.original.id) }, () => h(VueIcon, { name: 'bs:plus-lg' }))
        ])
      }
    },
    {
      header: 'Rejoint le',
      accessorKey: 'createdAt',
      cell: ({ cell }) => formatDate(new Date(cell.getValue() as string), 'DD/MM/YYYY')
    }
  ],
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
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
  <section class="space-y-8">
    <!-- Header -->
    <header class="flex flex-wrap items-center gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">Administration</p>
        <h1 class="hero-title flex items-center gap-3">
          <span class="rounded-2xl bg-white/5 p-3"><VueIcon name="bs:people-fill" class="text-accent-300" /></span>
          Gestion des utilisateurs
        </h1>
        <p class="muted flex items-center gap-2">{{ users.length }} utilisateur(s)</p>
      </div>
    </header>

    <!-- Users Table -->
    <div class="space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
        <p class="text-sm uppercase tracking-[0.4em] text-foam-300/70">Liste des utilisateurs</p>
        <div class="h-px flex-1 bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
      </div>
      <Card class="glass-panel p-0">
        <TableTanstack :table="table" :paginated="true" />
      </Card>
    </div>

    <!-- Reports Modal -->
    <Modal :is-open="isReportsModalOpen" @close="reportModalUserId = null">
      <template #header>
        <h2 class="hero-title text-xl">Reports</h2>
        <p class="muted text-sm">{{ users.find(u => u.id === reportModalUserId)?.username }}</p>
      </template>
      <div class="space-y-3">
        <Card v-for="report in users.find(user => user.id === reportModalUserId)?.reports || []" :key="report.id" class="glass-panel p-4">
          <p class="text-sm text-white">{{ report.reason }}</p>
          <p class="text-xs text-foam-300/70">{{ formatDate(new Date(report.createdAt), 'DD/MM/YYYY [à] HH:mm') }}</p>
          <Button variant="ghost" size="sm" class="self-end" @click="adminStore.removeReport(report.id, reportModalUserId || '')">Supprimer</Button>
        </Card>
        <p v-if="!(users.find(user => user.id === reportModalUserId)?.reports?.length)" class="text-center text-foam-300/70">Aucun report.</p>
      </div>
    </Modal>

    <!-- New Report Modal -->
    <Modal :is-open="isNewReportModalOpen" @close="newReportModalUserId = null">
      <template #header>
        <h2 class="hero-title text-xl">Créer un report</h2>
        <p class="muted text-sm">{{ users.find(u => u.id === newReportModalUserId)?.username }}</p>
      </template>
      <form v-if="newReportModalUserId" class="space-y-4" @submit.prevent="(e: Event) => { const target = e.target as HTMLFormElement; const reason = (target.elements.namedItem('reason') as HTMLTextAreaElement)?.value; adminStore.addReportToUser(newReportModalUserId!, reason); newReportModalUserId = null; }">
        <textarea id="reason" required class="w-full rounded-[var(--radius-lg)] border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-foam-300/60 focus:border-accent-300 focus:ring-2 focus:ring-accent-300/20 outline-none min-h-[120px]" placeholder="Décrivez la raison..."></textarea>
        <div class="flex justify-end gap-2">
          <Button type="button" variant="ghost" @click="newReportModalUserId = null">Annuler</Button>
          <Button type="submit">Envoyer</Button>
        </div>
      </form>
    </Modal>
  </section>
</template>