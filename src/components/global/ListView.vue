<script setup lang="ts" generic="T extends { id: string }">
import { ref } from 'vue';
import { Card } from '../ui';
import Paginator from '../ui/Paginator.vue';


const props = withDefaults(defineProps<{
  data: Array<T>;
  title?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  to?: (item: T) => string;
  maxCols?: number;
  paginate?: boolean;
  itemsPerPage?: number;
}>(), {
  data: () => [],
  emptyTitle: 'Aucun élément trouvé',
  maxCols: 3,
  paginate: false,
  itemsPerPage: 9,
});

const currentPage = ref(1);
const pagination = ref({ limit: props.itemsPerPage, offset: 0 });

const getGridColsClass = () => {
  switch (props.maxCols) {
    case 1:
      return 'grid gap-4 grid-cols-1';
    case 2:
      return 'grid gap-4 grid-cols-1 md:grid-cols-2';
    case 3:
      return 'grid gap-4 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3';
    default:
      return 'grid gap-4 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3';
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3" v-if="title">
      <div class="h-1 w-12 bg-gradient-to-r from-christmas-gold to-christmas-gold-light rounded-full"></div>
      <h1
        class="text-4xl font-bold bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-gold bg-clip-text text-transparent uppercase">
        {{ title }} ( {{ data.length }} )
      </h1>
    </div>

    <template v-if="data.length > 0">
      <div :class="getGridColsClass()">
        <RouterLink v-if="to" v-for="item in data.slice(pagination.offset, pagination.offset + pagination.limit)" :key="item.id" :to="to(item)" class="group">
          <slot name="item" :item="item" />
        </RouterLink>
        <slot v-else name="item" v-for="item in data.slice(pagination.offset, pagination.offset + pagination.limit)" :item="item" />
      </div>
      <Paginator v-if="paginate" v-model:current-page="currentPage" :total="data.length" :items-per-page="itemsPerPage" :max-visible-pages="3" @paginate="({ limit, offset }) => pagination = { limit, offset }" />
    </template>

    <div v-else class="col-span-1 md:col-span-2 lg:col-span-3">
      <Card class="p-8! text-center border-dashed border-2"
        style="background: linear-gradient(135deg, rgba(15, 76, 58, 0.1) 0%, rgba(196, 30, 58, 0.1) 100%); border-color: #D4AF37;">
        <slot name="emptyIcon" />
        <h2 class="text-2xl font-bold text-christmas-snow mb-2">{{ emptyTitle }}</h2>
        <p v-if="emptyMessage" class="text-christmas-gold-light">{{ emptyMessage }}</p>
      </Card>
    </div>
  </div>
</template>