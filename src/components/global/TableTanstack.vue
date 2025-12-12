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
    if (!first) return map;
    for (const h of first.headers) {
      map.set(h.column.id, h);
    }
  }
  return map;
});
</script>

<template>
  <div class="glass-panel overflow-hidden">
    <table class="w-full text-left text-white">
      <!-- en-têtes cachés sur mobile -->
      <thead class="hidden md:table-header-group bg-white/5">
        <tr v-for="hg in table.getHeaderGroups()" :key="hg.id">
          <th
            v-for="header in hg.headers"
            :key="header.id"
            :colspan="header.colSpan"
            class="px-4 py-3 text-xs uppercase tracking-[0.3em] text-foam-300/70 text-center text-nowrap"
            :class="header.column.getCanSort() ? 'cursor-pointer select-none' : ''"
            @click="header.column.getToggleSortingHandler()?.($event)"
          >
            <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
            <span v-if="header.column.getCanSort()">{{ { asc: '↑', desc: '↓' }[header.column.getIsSorted() as string] || '' }}</span>
          </th>
        </tr>
      </thead>

      <tbody class="block md:table-row-group">
        <!-- chaque ligne devient un "card" sur mobile -->
        <tr
          v-for="(row, idx) in table.getRowModel().rows"
          :key="row.id"
          class="block md:table-row md:border-t md:border-white/5 md:even:bg-white/2.5 mb-3 md:mb-0 rounded-lg md:rounded-none bg-white/5 md:bg-transparent overflow-hidden md:overflow-visible"
        >
          <td
            v-for="cell in row.getVisibleCells()"
            :key="cell.id"
            class="block md:table-cell px-4 py-2 md:py-4 text-sm text-foam-200/80 border-b md:border-b-0 border-white/5 last:border-b-0"
          >
            <div class="flex flex-row items-center md:flex-col md:items-center md:justify-center justify-between gap-2">
              <!-- label de la colonne (visible uniquement sur mobile) -->
              <span class="text-xs font-semibold text-foam-400/90 md:hidden flex-shrink-0">
                <template v-if="headerMap.get(cell.column.id)">
                  <FlexRender
                    :render="headerMap.get(cell.column.id).column.columnDef.header"
                    :props="headerMap.get(cell.column.id).getContext()"
                  />
                </template>
                <template v-else>{{ String(cell.column.columnDef.header ?? '') }}</template>
              </span>

              <!-- contenu de la cellule -->
              <div class="text-right md:text-center">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="flex items-center justify-center gap-2 border-t border-white/5 p-4" v-if="paginated && table.getPageCount() > 1">
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