<script setup lang="ts">

import useAdminStore from "@/stores/adminStore.ts";
import {h, onMounted, ref} from "vue";
import {getCoreRowModel, getPaginationRowModel, getSortedRowModel, useVueTable} from "@tanstack/vue-table";
import VueIcon from "@kalimahapps/vue-icons/VueIcon";
import {Avatar, Button, Card} from "@/components/ui";
import TableTanstack from "@/components/global/TableTanstack.vue";
import {useToastStore} from "@/stores/toastStore.ts";

const adminStore = useAdminStore();

onMounted(async () => {
  await adminStore.fetchScrimiums()
});

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
});

const table = useVueTable({
  get data() {
    return adminStore.scrimiums
  },
  columns: [
    { header: 'Utilisateur', cell: info => h('div', { class: 'flex flex-row gap-2 items-center justify-center' }, [h(Avatar, { size: 10, src: info.row.original.user?.avatarUrl }), info.row.original.user?.username]) },
    { header: 'Scrimiums', accessorKey: 'balance' },
    { header: 'Dernière activité', accessorKey: 'transactions', cell: info => info.getValue()[info.getValue().length-1] ? `${info.getValue()[info.getValue().length-1]?.amount ?? 0} | ${info.getValue()[info.getValue().length-1]?.description ?? ''}` : 'Aucune activité' },
    { header: 'Actions', cell: info => {
        return h('div', { class: "flex flex-col w-full gap-2"}, [
            h('input', { type: 'number', min: 0, placeholder: 'Montant', class: 'form-input', id: `scrimium-input-${info.row.original.user?.id}`  }),
            h('div', { class: 'flex flex-row gap-2 justify-end' }, [
              h(Button, { variant: "emerald", onclick: () => handleUpdateScrimium(info.row.original.user.id, 'add') }, "Ajouter"), h(Button, { variant: "danger", onclick: () => handleUpdateScrimium(info.row.original.user.id, 'remove') }, "Retirer")
            ])
          ]
        )
      }
    }
  ],
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
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

const handleUpdateScrimium = async (userId: string, action: 'add' | 'remove') => {
  const inputElement = document.getElementById(`scrimium-input-${userId}`) as HTMLInputElement;
  const amount = parseInt(inputElement.value);
  if (isNaN(amount) || amount <= 0) {
    useToastStore().error('Veuillez entrer un montant valide.');
    return;
  }
  await adminStore.updateScrimiumBalance(userId, amount, action);
  inputElement.value = '';
  await adminStore.fetchScrimiums();
};
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">Administration</p>
        <h1 class="hero-title flex items-center gap-3">
          <span class="rounded-2xl bg-white/5 p-3"><VueIcon name="bs:chat-left-quote" class="text-accent-300" /></span>
          Gestion des scrimiums
        </h1>
      </div>
    </header>

    <Card class="glass-panel p-0">
      <TableTanstack :table="table" :paginated="true" />
    </Card>
  </section>
</template>