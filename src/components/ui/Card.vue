<script setup lang="ts">
import { computed } from "vue";
import type { CardProps } from "@/types/ui";
import { useUIClasses } from "@/composables/useUIClasses";

interface Props extends CardProps {
  tag?: "div" | "article" | "section";
}

const props = withDefaults(defineProps<Props>(), {
  variant: "elevated",
  padding: "md",
  rounded: true,
  shadow: true,
  hoverable: false,
  tag: "div",
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const { getCardClasses } = useUIClasses();

// Classes calculées
const cardClasses = computed(() =>
  getCardClasses(
    props.variant,
    props.padding,
    props.rounded,
    props.shadow,
    props.hoverable
  )
);

const handleClick = (event: MouseEvent) => {
  if (props.hoverable) {
    emit("click", event);
  }
};
</script>

<template>
  <component :is="tag" :class="cardClasses" @click="handleClick">
    <!-- Header slot -->
    <header v-if="$slots.header" class="mb-4">
      <slot name="header" />
    </header>

    <!-- Contenu principal -->
    <div>
      <slot />
    </div>

    <!-- Footer slot -->
    <footer v-if="$slots.footer" class="mt-4">
      <slot name="footer" />
    </footer>
  </component>
</template>
