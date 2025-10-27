<script setup lang="ts" generic="T">
import { FlexRender, type Table } from '@tanstack/vue-table';
import { Button } from '../ui';

defineProps<{
  table: Table<T>;
  paginated?: boolean;
}>();
</script>

<template>
  <table class="w-full text-center text-christmas-ice border-christmas-gold border-2 rounded-lg">
    <thead>
      <tr v-for="hg in table.getHeaderGroups()" :key="hg.id" class="h-20 bg-christmas-navy/50 backdrop-blur-md">
        <th v-for="header in hg.headers" :key="header.id">
          <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in table.getRowModel().rows" :key="row.id" class="h-20 bg-christmas-navy/50 odd:bg-christmas-midnight/50 backdrop-blur-md">
        <td v-for="cell in row.getVisibleCells()" :key="cell.id">
          <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
        </td>
      </tr>
    </tbody>
  </table>

  <div class="flex items-center justify-center gap-2" v-if="paginated">
    <Button :onclick="() => table.firstPage()" :disabled="!table.getCanPreviousPage()">
      <<
    </Button>
    <Button :onclick="() => table.previousPage()" :disabled="!table.getCanPreviousPage()">
      <
    </Button>
    <span class="mx-2 text-christmas-ice">
      Page
      <strong>
        {{ table.getState().pagination.pageIndex + 1 }} / {{ table.getPageCount() }}
      </strong>
    </span>
    <Button :onclick="() => table.nextPage()" :disabled="!table.getCanNextPage()">
      >
    </Button>
    <Button :onclick="() => table.lastPage()" :disabled="!table.getCanNextPage()">
      >>
    </Button>
  </div>
</template>