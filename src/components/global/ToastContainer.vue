<script setup lang="ts">
import { Teleport } from 'vue';
import Toast from '../ui/Toast.vue';
import { useToastStore } from '../../stores/toastStore';

const toastStore = useToastStore();
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <Toast
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        :id="toast.id"
        :message="toast.message"
        :details="toast.details"
        :type="toast.type"
        :duration="toast.duration"
        @remove="toastStore.removeToast"
        class="pointer-events-auto"
      />
    </div>
  </Teleport>
</template>