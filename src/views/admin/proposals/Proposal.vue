<script setup lang="ts">
import TableTanstack from '@/components/global/TableTanstack.vue';
import {Button, Card } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import {useToastStore} from '@/stores/toastStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import {getCoreRowModel, getPaginationRowModel, getSortedRowModel, useVueTable} from '@tanstack/vue-table';
import {formatDate} from '@vueuse/core';
import {computed, h, nextTick, onMounted, ref} from 'vue';
import {useTablePaginationQueryString} from "@/composables/useTablePaginationQueryString";

const adminStore = useAdminStore();
const toastStore = useToastStore();
const proposals = computed(() => adminStore.proposals);
const processingId = ref<string | null>(null);

const paginationQs = useTablePaginationQueryString({ param: 'page', defaultPage: 1, cleanDefault: false });

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
            : h('div', { class: 'w-12 h-12 rounded-lg bg-ink-800/60 flex items-center justify-center' }, [
                h(VueIcon, { name: 'bs:image', class: 'text-accent-300' })
              ]),
          h('div', [
            h('p', { class: 'font-semibold text-white' }, row.original.name),
            h('p', { class: 'text-xs text-foam-300/70' }, `ID: ${row.original.id}`)
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
            class: 'w-8 h-8 rounded-full object-cover border border-white/10'
          }),
          h('span', { class: 'text-white' }, proposedBy.username)
        ]);
      },
      sortingFn: 'alphanumeric'
    },
    {
      header: 'Votes',
      accessorKey: 'votes.length',
      cell: ({ row }) => {
        return h('div', { class: 'flex items-center gap-2' }, [
          h(VueIcon, { name: 'bs:hand-thumbs-up-fill', class: 'text-accent-300' }),
          h('span', { class: 'font-semibold text-white' }, row.original.votes?.length || 0)
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
        return h('span', { class: 'text-foam-300 text-sm' },
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
            variant: 'danger',
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
  autoResetPageIndex: false,
  state: {
    get pagination() {
      return paginationQs.pagination.value;
    }
  },
  onPaginationChange: paginationQs.onPaginationChange
});

onMounted(async () => {
  await adminStore.fetchProposals();
  await nextTick();
  const targetPageIndex = paginationQs.pagination.value.pageIndex;
  const pageCount = table.getPageCount();
  if (targetPageIndex > 0 && pageCount > 0 && targetPageIndex < pageCount) {
    table.setPageIndex(targetPageIndex);
  }
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
  <section class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">Administration</p>
        <h1 class="hero-title flex items-center gap-3">
          <span class="rounded-2xl bg-white/5 p-3"><VueIcon name="bs:chat-left-quote" class="text-accent-300" /></span>
          Gestion des propositions de jeux
        </h1>
        <p class="muted">{{ proposals.length }} proposition(s)</p>
      </div>
    </header>

    <Card class="glass-panel p-0" v-if="proposals.length > 0">
      <TableTanstack :table="table" :paginated="true" />
    </Card>
    <Card v-else class="glass-panel p-8 text-center text-foam-300/70">
      <VueIcon name="bs:inbox" class="mx-auto mb-4 text-4xl" />
      Aucune proposition pour le moment.
    </Card>
  </section>
</template>
