<script setup lang="ts" generic="T extends { id: string }">
import { ref, computed, onMounted, watch } from 'vue';
import { useElementSize } from '@vueuse/core';

interface Props {
  items: T[];
  itemHeight: number;
  itemWidth: number;
  gap?: number;
  overscan?: number;
}

const props = withDefaults(defineProps<Props>(), {
  gap: 16,
  overscan: 3
});

const emit = defineEmits<{
  itemVisible: [item: T, index: number];
}>();

const containerRef = ref<HTMLElement | null>(null);
const { width: containerWidth } = useElementSize(containerRef);
const scrollTop = ref(0);
const emittedItems = ref(new Set<string>()); // Track emitted items

// Calculate columns based on container width
const columns = computed(() => {
  if (containerWidth.value === 0) return 1;
  // Calculate how many items fit, accounting for gaps properly
  return Math.max(1, Math.floor(containerWidth.value / (props.itemWidth + props.gap)));
});

// Calculate total rows
const totalRows = computed(() => Math.ceil(props.items.length / columns.value));

// Calculate visible range
const visibleRange = computed(() => {
  const rowHeight = props.itemHeight + props.gap;
  const startRow = Math.max(0, Math.floor(scrollTop.value / rowHeight) - props.overscan);
  const endRow = Math.min(
    totalRows.value,
    Math.ceil((scrollTop.value + (containerRef.value?.clientHeight || 0)) / rowHeight) + props.overscan
  );
  
  const startIndex = startRow * columns.value;
  const endIndex = Math.min(props.items.length, endRow * columns.value);
  
  return { startIndex, endIndex, startRow };
});

// Get visible items with positioning
const visibleItems = computed(() => {
  const items = [];
  const { startIndex, endIndex } = visibleRange.value;
  
  for (let i = startIndex; i < endIndex; i++) {
    const item = props.items[i];
    if (!item) continue;
    
    const row = Math.floor(i / columns.value);
    const col = i % columns.value;
    
    items.push({
      item,
      index: i,
      top: row * (props.itemHeight + props.gap),
      left: col * (props.itemWidth + props.gap)
    });
  }
  
  return items;
});

// Total height for scrolling
const totalHeight = computed(() => {
  return totalRows.value * (props.itemHeight + props.gap) - props.gap;
});

const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement;
  scrollTop.value = target.scrollTop;
};

// Emit visible items when they change (only newly visible)
watch(visibleItems, (items) => {
  items.forEach(({ item, index }) => {
    if (!emittedItems.value.has(item.id)) {
      emittedItems.value.add(item.id);
      emit('itemVisible', item, index);
    }
  });
  
  // Clean up emitted items that are no longer visible
  const currentIds = new Set(items.map(i => i.item.id));
  emittedItems.value.forEach(id => {
    if (!currentIds.has(id)) {
      emittedItems.value.delete(id);
    }
  });
}, { immediate: true });

onMounted(() => {
  if (containerRef.value) {
    scrollTop.value = containerRef.value.scrollTop;
  }
});

defineExpose({
  scrollToIndex: (index: number) => {
    if (!containerRef.value) return;
    const row = Math.floor(index / columns.value);
    const top = row * (props.itemHeight + props.gap);
    containerRef.value.scrollTop = top;
  }
});
</script>

<template>
  <div
    ref="containerRef"
    class="virtual-grid-container"
    @scroll="handleScroll"
  >
    <div
      class="virtual-grid-spacer"
      :style="{ height: `${totalHeight}px`, position: 'relative' }"
    >
      <div
        v-for="{ item, index, top, left } in visibleItems"
        :key="item.id"
        class="virtual-grid-item"
        :style="{
          position: 'absolute',
          top: `${top}px`,
          left: `${left}px`,
          width: `${itemWidth}px`,
          height: `${itemHeight}px`
        }"
      >
        <slot name="item" :item="item" :index="index" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-grid-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

.virtual-grid-spacer {
  position: relative;
  width: 100%;
}

.virtual-grid-item {
  contain: layout style paint;
  will-change: transform;
}
</style>
