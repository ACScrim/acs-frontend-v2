<script setup lang="ts" generic="T">
import { computed } from 'vue';
import { FlexRender, type Table } from '@tanstack/vue-table';
import { Button } from '../ui';

const props = defineProps<{
  table: Table<T>;
  paginated?: boolean;
}>();

// Exposer des raccourcis pour le template
const table = props.table;
const paginated = props.paginated ?? false;

// Map columnId -> header object (pour rendre le label dans chaque cellule en mobile)
const headerMap = computed(() => {
  const map = new Map<string, any>();
  const groups = table.getHeaderGroups();
  if (groups.length) {
    const first = groups[0];
    for (const h of first.headers) {
      map.set(h.column.id, h);
    }
  }
  return map;
});
</script>

<template>
  <div class="glass-panel overflow-hidden">
    <table class="w-full text-left text-white md:table">
      <!-- en-têtes cachés sur mobile -->
      <thead class="hidden md:table-header-group bg-white/5">
        <tr v-for="hg in table.getHeaderGroups()" :key="hg.id">
          <th
            v-for="header in hg.headers"
            :key="header.id"
            :colspan="header.colSpan"
            class="px-4 py-3 text-xs uppercase tracking-[0.3em] text-foam-300/70"
            :class="header.column.getCanSort() ? 'cursor-pointer select-none' : ''"
            @click="header.column.getToggleSortingHandler()?.($event)"
          >
            <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
            <span v-if="header.column.getCanSort()">{{ { asc: '↑', desc: '↓' }[header.column.getIsSorted() as string] || '' }}</span>
          </th>
        </tr>
      </thead>

      <tbody>
        <!-- chaque ligne devient un "card" sur mobile -->
        <tr
          v-for="row in table.getRowModel().rows"
          :key="row.id"
          class="block md:table-row border-t border-white/5"
        >
          <td
            v-for="cell in row.getVisibleCells()"
            :key="cell.id"
            class="block md:table-cell px-4 py-4 text-sm text-foam-200/80"
          >
            <div class="flex flex-col md:flex-row md:items-center">
              <!-- label de la colonne (visible uniquement sur mobile) -->
              <span class="text-xs text-foam-300/70 md:hidden">
                <template v-if="headerMap.get(cell.column.id)">
                  <FlexRender
                    :render="headerMap.get(cell.column.id).column.columnDef.header"
                    :props="headerMap.get(cell.column.id).getContext()"
                  />
                </template>
                <template v-else>{{ String(cell.column.columnDef.header ?? '') }}</template>
              </span>

              <!-- contenu de la cellule -->
              <div class="mt-1 md:mt-0">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="flex items-center justify-center gap-2 border-t border-white/5 p-4" v-if="paginated">
      <Button variant="ghost" :disabled="!table.getCanPreviousPage()" @click="table.firstPage()">⟪</Button>
      <Button variant="ghost" :disabled="!table.getCanPreviousPage()" @click="table.previousPage()">‹</Button>
      <span class="text-sm text-foam-200/80">
        Page <strong>{{ table.getState().pagination.pageIndex + 1 }} / {{ table.getPageCount() }}</strong>
      </span>
      <Button variant="ghost" :disabled="!table.getCanNextPage()" @click="table.nextPage()">›</Button>
      <Button variant="ghost" :disabled="!table.getCanNextPage()" @click="table.lastPage()">⟫</Button>
    </div>
  </div>
</template>