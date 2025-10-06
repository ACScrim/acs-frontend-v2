import { ref } from "vue";
import type { ToastProps, ToastType } from "@/types/ui";

// Interface pour un toast avec ID
interface ToastItem extends ToastProps {
  id: string;
}

// État global des toasts
const toasts = ref<ToastItem[]>([]);

// Compteur pour générer des IDs uniques
let toastCounter = 0;

// Fonction utilitaire pour générer un ID unique
const generateToastId = (): string => {
  return `toast-${++toastCounter}-${Date.now()}`;
};

// Fonction principale pour ajouter un toast
export const useToast = () => {
  const addToast = (
    options: Omit<ToastProps, "type"> & { type?: ToastType }
  ) => {
    const toast: ToastItem = {
      id: generateToastId(),
      type: "info",
      duration: 5000,
      position: "top-right",
      closable: true,
      persistent: false,
      ...options,
    };

    toasts.value.push(toast);
    return toast.id;
  };

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex((toast) => toast.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const clearToasts = () => {
    toasts.value = [];
  };

  // Méthodes de convenance pour chaque type
  const success = (message: string, options?: Partial<ToastProps>) => {
    return addToast({
      type: "success",
      message,
      title: "Succès",
      ...options,
    });
  };

  const error = (message: string, options?: Partial<ToastProps>) => {
    return addToast({
      type: "error",
      message,
      title: "Erreur",
      persistent: true, // Les erreurs restent par défaut
      ...options,
    });
  };

  const warning = (message: string, options?: Partial<ToastProps>) => {
    return addToast({
      type: "warning",
      message,
      title: "Attention",
      ...options,
    });
  };

  const info = (message: string, options?: Partial<ToastProps>) => {
    return addToast({
      type: "info",
      message,
      title: "Information",
      ...options,
    });
  };

  const gaming = (message: string, options?: Partial<ToastProps>) => {
    return addToast({
      type: "gaming",
      message,
      title: "ACS Gaming",
      duration: 7000, // Plus long pour les notifications gaming
      ...options,
    });
  };

  return {
    // État
    toasts: toasts.value,

    // Méthodes principales
    addToast,
    removeToast,
    clearToasts,

    // Méthodes de convenance
    success,
    error,
    warning,
    info,
    gaming,
  };
};

// Composant global pour afficher tous les toasts
export const getToastList = () => toasts.value;
