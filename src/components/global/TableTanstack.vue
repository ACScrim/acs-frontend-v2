<script setup lang="ts" generic="T">
import { FlexRender, type Table } from '@tanstack/vue-table';
import { Button } from '../ui';

defineProps<{
  table: Table<T>;
  paginated?: boolean;
}>();
</script>

<template>
  <div class="glass-panel overflow-hidden">
    <table class="w-full text-left text-white">
      <thead class="bg-white/5">
        <tr v-for="hg in table.getHeaderGroups()" :key="hg.id">
          <th v-for="header in hg.headers" :key="header.id" :colspan="header.colSpan" class="px-4 py-3 text-xs uppercase tracking-[0.3em] text-foam-300/70" :class="header.column.getCanSort() ? 'cursor-pointer select-none' : ''" @click="header.column.getToggleSortingHandler()?.($event)">
            <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
            {{ { asc: '↑', desc: '↓' }[header.column.getIsSorted() as string] || '' }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in table.getRowModel().rows" :key="row.id" class="border-t border-white/5">
          <td v-for="cell in row.getVisibleCells()" :key="cell.id" class="px-4 py-4 text-sm text-foam-200/80">
            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
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