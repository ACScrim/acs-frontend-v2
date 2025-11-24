<script setup lang="ts">
import TableTanstack from '@/components/global/TableTanstack.vue';
import {Button} from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import {useToastStore} from '@/stores/toastStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import {getCoreRowModel, getPaginationRowModel, getSortedRowModel, useVueTable} from '@tanstack/vue-table';
import {formatDate} from '@vueuse/core';
import {computed, h, onMounted, ref} from 'vue';

const adminStore = useAdminStore();
const toastStore = useToastStore();
const proposals = computed(() => adminStore.proposals);
const processingId = ref<string | null>(null);

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
});

const table = useVueTable({
  get data() {
    return proposals.value;
  },
  columns: [
    {
      header: 'Jeu',
      accessorKey: 'name',
      cell: ({ row }) => {
        return h('div', { class: 'flex items-center gap-3' }, [
          row.original.imageUrl
            ? h('img', {
                src: row.original.imageUrl,
                alt: row.original.name,
                class: 'w-12 h-12 rounded-lg object-cover'
              })
            : h('div', { class: 'w-12 h-12 rounded-lg bg-christmas-navy/30 flex items-center justify-center' }, [
                h(VueIcon, { name: 'bs:image', class: 'text-christmas-gold' })
              ]),
          h('div', [
            h('p', { class: 'font-semibold text-christmas-ice' }, row.original.name),
            h('p', { class: 'text-xs text-christmas-gold-light/70' }, `ID: ${row.original.id}`)
          ])
        ]);
      },
      sortingFn: 'alphanumeric'
    },
    {
      header: 'Proposé par',
      accessorKey: 'proposedBy.username',
      cell: ({ row }) => {
        const proposedBy = row.original.proposedBy;
        return h('div', { class: 'flex items-center gap-2' }, [
          h('img', {
            src: proposedBy.avatarUrl || 'https://via.placeholder.com/32',
            alt: proposedBy.username,
            class: 'w-8 h-8 rounded-full object-cover'
          }),
          h('span', { class: 'text-christmas-ice' }, proposedBy.username)
        ]);
      },
      sortingFn: 'alphanumeric'
    },
    {
      header: 'Votes',
      accessorKey: 'votes.length',
      cell: ({ row }) => {
        return h('div', { class: 'flex items-center gap-2' }, [
          h(VueIcon, { name: 'bs:hand-thumbs-up-fill', class: 'text-christmas-gold' }),
          h('span', { class: 'font-semibold text-christmas-ice' }, row.original.votes?.length || 0)
        ]);
      },
      sortingFn: (rowA, rowB) => {
        return (rowA.original.votes?.length || 0) - (rowB.original.votes?.length || 0);
      }
    },
    {
      header: 'Proposé le',
      accessorKey: 'createdAt',
      cell: ({ row }) => {
        return h('span', { class: 'text-christmas-gold-light text-sm' },
          formatDate(new Date(row.original.createdAt), 'DD/MM/YYYY HH:mm')
        );
      },
      sortingFn: (rowA, rowB) => {
        return new Date(rowB.original.createdAt).getTime() - new Date(rowA.original.createdAt).getTime();
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => {
        return h('div', { class: 'flex items-center gap-2' }, [
          h(Button, {
            onClick: () => handleRejectProposal(row.original.id),
            color: 'christmas-red',
            class: 'flex items-center gap-2 h-fit',
            disabled: processingId.value === row.original.id
          }, {
            default: () => [
              h(VueIcon, { name: processingId.value === row.original.id ? 'bs:hourglass-split' : 'bs:trash' })
            ]
          })
        ]);
      }
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

onMounted(() => {
  adminStore.fetchProposals();
});

const handleRejectProposal = async (proposalId: string) => {
  if (!confirm('Êtes-vous sûr de vouloir rejeter cette proposition ? Cette action est irréversible.')) {
    return;
  }

  try {
    processingId.value = proposalId;
    await adminStore.rejectProposal(proposalId);
    toastStore.success('La proposition a été rejetée.');
  } catch (error) {
    toastStore.error('Erreur lors du rejet de la proposition.');
  } finally {
    processingId.value = null;
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-christmas-ice">Gestion des propositions de jeux</h1>
      <p class="text-christmas-gold-light/70 text-sm">{{ proposals.length }} proposition(s)</p>
    </div>

    <TableTanstack
      v-if="proposals.length > 0"
      :table="table"
      paginated
    />
    <div v-else class="text-center py-12 text-christmas-gold-light/70">
      <VueIcon name="bs:inbox" class="mx-auto text-4xl mb-4 opacity-50" />
      <p>Aucune proposition de jeu pour le moment.</p>
    </div>
  </div>
</template>

