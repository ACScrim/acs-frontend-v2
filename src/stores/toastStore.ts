import { defineStore } from 'pinia';
import { ref } from 'vue';

interface Toast {
  id: string;
  message: string;
  details?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([]);

  const addToast = ({message, details}: {message: string, details?: string}, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) => {
    const id = Date.now().toString();
    toasts.value.push({
      id,
      message,
      details,
      type,
      duration,
    });
  };

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter(toast => toast.id !== id);
  };

  const success = (message: string, details?: string, duration?: number) => addToast({ message, details }, 'success', duration);
  const error = (message: string, details?: string, duration?: number) => addToast({ message, details }, 'error', duration);
  const info = (message: string, details?: string, duration?: number) => addToast({ message, details }, 'info', duration);
  const warning = (message: string, details?: string, duration?: number) => addToast({ message, details }, 'warning', duration);

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