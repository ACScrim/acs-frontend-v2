<script setup lang="ts">
import { computed } from "vue";
import { Toast } from "@/components/ui";
import { getToastList, useToast } from "@/composables/useToast";

// Emits
defineEmits<{
  action: [toast: any];
}>();

// Récupération des toasts globaux
const toasts = computed(() => getToastList());
const { removeToast } = useToast();

// Grouper les toasts par position
const toastsByPosition = computed(() => {
  const groups: Record<string, typeof toasts.value> = {};

  toasts.value.forEach((toast) => {
    const position = toast.position || "top-right";
    if (!groups[position]) {
      groups[position] = [];
    }
    groups[position].push(toast);
  });

  return groups;
});

// Classes pour les conteneurs de position
const getPositionContainerClasses = (position: string) => {
  const baseClasses = ["fixed z-50 pointer-events-none"];

  const positionClasses: Record<string, string[]> = {
    "top-right": ["top-4", "right-4"],
    "top-left": ["top-4", "left-4"],
    "bottom-right": ["bottom-4", "right-4"],
    "bottom-left": ["bottom-4", "left-4"],
    "top-center": ["top-4", "left-1/2", "transform", "-translate-x-1/2"],
    "bottom-center": ["bottom-4", "left-1/2", "transform", "-translate-x-1/2"],
  };

  return [
    ...baseClasses,
    ...(positionClasses[position] || positionClasses["top-right"] || []),
  ];
};

// Gestion de la fermeture des toasts
const handleToastClose = (toastId: string) => {
  removeToast(toastId);
};
</script>

<template>
  <!-- Conteneurs pour chaque position -->
  <div v-for="(positionToasts, position) in toastsByPosition" :key="position">
    <div :class="getPositionContainerClasses(position)">
      <div class="space-y-2 pointer-events-auto">
        <TransitionGroup
          tag="div"
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 transform scale-95 translate-y-2"
          enter-to-class="opacity-100 transform scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 transform scale-100 translate-y-0"
          leave-to-class="opacity-0 transform scale-95 -translate-y-2"
          class="space-y-2"
        >
          <Toast
            v-for="toast in positionToasts"
            :key="toast.id"
            :type="toast.type"
            :title="toast.title"
            :message="toast.message"
            :duration="toast.duration"
            :position="toast.position"
            :closable="toast.closable"
            :persistent="toast.persistent"
            :action-text="toast.actionText"
            @close="handleToastClose(toast.id)"
            @action="$emit('action', toast)"
          >
            <template v-if="$slots[`toast-${toast.id}`]" #default>
              <slot :name="`toast-${toast.id}`" :toast="toast" />
            </template>
          </Toast>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>
