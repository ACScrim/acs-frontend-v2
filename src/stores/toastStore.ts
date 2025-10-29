import { defineStore } from 'pinia';
import { ref } from 'vue';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) => {
    const id = Date.now().toString();
    toasts.value.push({
      id,
      message,
      type,
      duration,
    });
  };

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter(toast => toast.id !== id);
  };

  const success = (message: string, duration?: number) => addToast(message, 'success', duration);
  const error = (message: string, duration?: number) => addToast(message, 'error', duration);
  const info = (message: string, duration?: number) => addToast(message, 'info', duration);
  const warning = (message: string, duration?: number) => addToast(message, 'warning', duration);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };
});