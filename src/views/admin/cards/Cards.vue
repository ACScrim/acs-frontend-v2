<script setup lang="ts">

import TableTanstack from "@/components/global/TableTanstack.vue";
import VueIcon from "@kalimahapps/vue-icons/VueIcon";
import {Button, Card} from "@/components/ui";
import useAdminStore from "@/stores/adminStore.ts";
import {computed, h, onMounted, ref} from "vue";
import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel, type SortingState,
  useVueTable
} from "@tanstack/vue-table";
import type {CollectibleCard as CollectibleCardType} from "@/types/models";
import {formatDate} from "@vueuse/core";
import CollectibleCard from "@/views/games/card-creator/CollectibleCard.vue";

const adminStore = useAdminStore();

const cards = computed(() => adminStore.cards)

onMounted(async () => {
  await adminStore.fetchCards();
});

const pagination = ref({
  pageIndex: 0,
  pageSize: 5
});

const sorting = ref<SortingState>([
  { id: "createdAt", desc: true },
]);

const columns: ColumnDef<CollectibleCardType>[] = [
  { header: 'Titre', accessorKey: 'title' },
  { header: 'Proposé par', accessorKey: 'createdBy.username' },
  { header: 'Rareté', accessorKey: 'rarity' },
  { header: 'Créée le', accessorKey: 'createdAt', cell: (info) =>  formatDate(new Date(info.getValue() as string), 'DD/MM/YYYY HH:mm'), sortDescFirst: true },
  { header: 'Statut', accessorKey: 'status' },
  { header: 'Preview', cell: info => {
    return h(CollectibleCard, { card: info.row.original, maxWidth: 120 });
  }},
  { header: 'Actions', cell: (info) => {
    if (info.row.original.status === "pending") {
      return h('div', { class: 'flex flex-col justify-center gap-2' }, [
        h(Button, { variant: "emerald", onclick: () => adminStore.approveCard(info.row.original.id)}, 'Approuver'),
        h(Button, { variant: "danger", onclick: () => adminStore.rejectCard(info.row.original.id) }, 'Rejeter'),
      ])
    }
    else if (info.row.original.status === "active") { return `Acceptée le ${formatDate(new Date(info.row.original.updatedAt), "DD/MM/YYYY")}` }
    else if (info.row.original.status === "inactive") { return `Rejetée le ${formatDate(new Date(info.row.original.updatedAt), "DD/MM/YYYY")}` }
  }}
]

const table = useVueTable({
  get data() {
    return cards.value
  },
  columns: columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  state: {
    get pagination() {
      return pagination.value;
    },
    get sorting() {
      return sorting.value;
    }
  },
  onPaginationChange: (updater) => {
    pagination.value = typeof updater === 'function' ? updater(pagination.value) : updater;
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater;
  }
})
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
        <p class="muted">{{ cards.length }} carte(s)</p>
      </div>
    </header>

    <Card class="glass-panel p-0" v-if="cards.length > 0">
      <TableTanstack :table="table" :paginated="true" />
    </Card>
    <Card v-else class="glass-panel p-8 text-center text-foam-300/70">
      <VueIcon name="bs:inbox" class="mx-auto mb-4 text-4xl" />
      Aucune proposition pour le moment.
    </Card>
  </section>
</template>