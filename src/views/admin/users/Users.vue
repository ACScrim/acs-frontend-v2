<script setup lang="ts">
import TableTanstack from '@/components/global/TableTanstack.vue';
import { Avatar } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import { getCoreRowModel, getPaginationRowModel, useVueTable } from '@tanstack/vue-table';
import { formatDate } from '@vueuse/core';
import { computed, h, onMounted, ref } from 'vue';

const adminStore = useAdminStore();
const users = computed(() => adminStore.users);

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
});

const table = useVueTable({
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
        return h('button', {
          class: 'underline underline-offset-2',
          onClick: () => {
            openReportsModal(row.original.id);
          }
        }, cell.getValue());
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
})

const openReportsModal = (userId: string) => {
  alert(`Open reports modal for user ID: ${userId}`);
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
</template>