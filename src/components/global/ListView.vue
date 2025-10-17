<script setup lang="ts" generic="T extends { id: string }">
import { Card } from '../ui';


defineProps<{
  data: Array<T>;
  title: string;
  emptyTitle: string;
  emptyMessage: string;
  to?: (item: T) => string;
}>();
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <div class="h-1 w-12 bg-gradient-to-r from-christmas-gold to-christmas-gold-light rounded-full"></div>
      <h1 class="text-4xl font-bold bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-gold bg-clip-text text-transparent uppercase">
        {{ title }} ( {{ data.length }} )
      </h1>
    </div>

    <div v-if="data.length > 0" class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
      <RouterLink 
        v-if="to"
        v-for="item in data" 
        :key="item.id"
        :to="to(item)"
        class="group"
      >
        <slot name="item" :item="item" />
      </RouterLink>
      <slot v-else name="item" v-for="item in data" :item="item" />
    </div>

    <div v-else class="col-span-1 md:col-span-2 lg:col-span-3">
      <Card 
        class="p-8! text-center border-dashed border-2"
        style="background: linear-gradient(135deg, rgba(15, 76, 58, 0.1) 0%, rgba(196, 30, 58, 0.1) 100%); border-color: #D4AF37;"
      >
      <slot name="emptyIcon" />
      <h2 class="text-2xl font-bold text-christmas-snow mb-2">{{ emptyTitle }}</h2>
      <p class="text-christmas-gold-light">{{ emptyMessage }}</p>
      </Card>
    </div>
  </div>
</template>