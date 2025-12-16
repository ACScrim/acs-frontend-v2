<script setup lang="ts" generic="T extends { id: string }">
import {ref, computed, watch} from 'vue';
import { Card } from '../ui';
import Paginator from '../ui/Paginator.vue';
import { RouterLink } from 'vue-router';


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

const paged = computed(() => {
  if (!props.paginate) {
    return props.data;
  }
  return props.data.slice(pagination.value.offset, pagination.value.offset + pagination.value.limit);
});

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

const emit = defineEmits<{
  'updateCurrentPage': [page: number]
}>();
</script>

<template>
  <div class="space-y-8">
    <div v-if="title" class="flex items-center gap-4">
      <div class="h-px w-16 bg-gradient-to-r from-white/0 via-white/40 to-white/0" />
      <div>
        <p class="text-xs uppercase tracking-[0.4em] text-foam-300/60">Focus</p>
        <h1 class="text-2xl font-semibold text-white/90">{{ title }} <span class="text-foam-200/60">({{ data.length }})</span></h1>
      </div>
    </div>

    <template v-if="data.length > 0">
      <div :class="getGridColsClass()" class="gap-6 justify-items-center">
        <slot name="add-preprend" />
        <RouterLink
          v-if="to"
          v-for="item in paged"
          :key="item.id"
          :to="to(item)"
          class="group"
        >
          <slot name="item" :item="item" />
        </RouterLink>
        <slot v-else name="item" v-for="item in paged" :item="item" />
        <slot name="add-append" />
      </div>
      <Paginator v-if="paginate" v-model:current-page="currentPage" :total="data.length" :items-per-page="itemsPerPage" :max-visible-pages="3" @paginate="({ limit, offset }) => pagination = { limit, offset }" @update:currentPage="page => emit('updateCurrentPage', page)" />
    </template>

    <div v-else>
      <Card class="glass-panel border-dashed border-white/10 p-10 text-center">
        <slot name="emptyIcon" />
        <h2 class="hero-title text-3xl">{{ emptyTitle }}</h2>
        <p v-if="emptyMessage" class="mt-2 text-foam-200/80">{{ emptyMessage }}</p>
      </Card>
    </div>
  </div>
</template>