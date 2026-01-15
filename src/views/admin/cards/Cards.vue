<script setup lang="ts">
import TableTanstack from "@/components/global/TableTanstack.vue";
import VueIcon from "@kalimahapps/vue-icons/VueIcon";
import { Button, Card } from "@/components/ui";
import useAdminStore from "@/stores/adminStore.ts";
import { computed, h, nextTick, onMounted, ref } from "vue";
import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useVueTable,
} from "@tanstack/vue-table";
import type { CollectibleCard as CollectibleCardType } from "@/types/models";
import { formatDate } from "@vueuse/core";
import CollectibleCard from "@/views/games/card-creator/CollectibleCard.vue";
import { useTablePaginationQueryString } from "@/composables/useTablePaginationQueryString";
import { useRouter } from "vue-router";

const adminStore = useAdminStore();
const router = useRouter();

const cards = computed(() => adminStore.cards);

const paginationQs = useTablePaginationQueryString({
  param: "page",
  defaultPage: 1,
  cleanDefault: false,
});

const sorting = ref<SortingState>([{ id: "createdAt", desc: true }]);

const columns: ColumnDef<CollectibleCardType>[] = [
  { header: "Titre", accessorKey: "title" },
  { header: "Proposé par", accessorKey: "createdBy.username" },
  {
    header: "Rareté",
    accessorKey: "rarity",
    cell: (info) => {
      const card = info.row.original;
      const current =
        (info.getValue() as CollectibleCardType["rarity"]) ?? "common";

      return h(
        "select",
        {
          class: "form-input !py-1 !text-xs min-w-32",
          value: current,
          onchange: async (e: Event) => {
            const next = (e.target as HTMLSelectElement)
              .value as CollectibleCardType["rarity"];
            if (!card?.id || next === card.rarity) return;

            try {
              await adminStore.updateCard(card.id, { rarity: next } as any);
            } catch {
              // revert UI to previous value if API fails
              (e.target as HTMLSelectElement).value = (card.rarity ??
                current) as any;
            }
          },
        },
        [
          h("option", { value: "common" }, "common"),
          h("option", { value: "uncommon" }, "uncommon"),
          h("option", { value: "rare" }, "rare"),
          h("option", { value: "epic" }, "epic"),
          h("option", { value: "legendary" }, "legendary"),
        ]
      );
    },
  },
  {
    header: "Créée le",
    accessorKey: "createdAt",
    cell: (info) =>
      formatDate(new Date(info.getValue() as string), "DD/MM/YYYY HH:mm"),
    sortDescFirst: true,
  },
  { header: "Statut", accessorKey: "status" },
  {
    header: "Preview",
    cell: (info) => {
      return h(CollectibleCard, { card: info.row.original, maxWidth: 120 });
    },
  },
  {
    header: "Actions",
    cell: (info) => {
      const card = info.row.original;

      const editBtn = h(
        Button,
        {
          variant: "outline",
          onclick: () => router.push(`/admin/cards/${card.id}/edit`),
        },
        "Modifier"
      );

      if (card.status === "pending") {
        return h("div", { class: "flex flex-col justify-center gap-2" }, [
          editBtn,
          h(
            Button,
            {
              variant: "emerald",
              onclick: () => adminStore.approveCard(card.id),
            },
            "Approuver"
          ),
          h(
            Button,
            {
              variant: "danger",
              onclick: () => adminStore.rejectCard(card.id),
            },
            "Rejeter"
          ),
        ]);
      } else if (card.status === "active") {
        return h("div", { class: "flex flex-col justify-center gap-2" }, [
          editBtn,
          `Acceptée le ${formatDate(new Date(card.updatedAt), "DD/MM/YYYY")}`,
        ]);
      } else if (card.status === "inactive") {
        return h("div", { class: "flex flex-col justify-center gap-2" }, [
          editBtn,
          `Rejetée le ${formatDate(new Date(card.updatedAt), "DD/MM/YYYY")}`,
        ]);
      }

      return h("div", { class: "flex flex-col justify-center gap-2" }, [
        editBtn,
      ]);
    },
  },
];

const table = useVueTable({
  get data() {
    return cards.value;
  },
  columns: columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  autoResetPageIndex: false,
  state: {
    get pagination() {
      return paginationQs.pagination.value;
    },
    get sorting() {
      return sorting.value;
    },
  },
  onPaginationChange: paginationQs.onPaginationChange,
  onSortingChange: (updater) => {
    sorting.value =
      typeof updater === "function" ? updater(sorting.value) : updater;
  },
});

onMounted(async () => {
  await adminStore.fetchCards();
  await nextTick();
  const targetPageIndex = paginationQs.pagination.value.pageIndex;
  const pageCount = table.getPageCount();
  if (targetPageIndex > 0 && pageCount > 0 && targetPageIndex < pageCount) {
    table.setPageIndex(targetPageIndex);
  }
});
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">
          Administration
        </p>
        <h1 class="hero-title flex items-center gap-3">
          <span class="rounded-2xl bg-white/5 p-3"
            ><VueIcon name="bs:chat-left-quote" class="text-accent-300"
          /></span>
          Gestion des propositions de cartes
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
