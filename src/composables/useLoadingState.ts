import { ref, computed } from 'vue';

// Store global pour tracker les requêtes en cours
const pendingRequests = ref<Set<string>>(new Set());
const requestCounter = ref(0);

export const useLoadingState = () => {
  // Indique s'il y a au moins une requête en cours
  const isLoading = computed(() => pendingRequests.value.size > 0);

  // Nombre total de requêtes en cours
  const pendingCount = computed(() => pendingRequests.value.size);

  // Ajoute une requête au tracking
  const startRequest = (requestId: string) => {
    pendingRequests.value.add(requestId);
  };

  // Retire une requête du tracking
  const endRequest = (requestId: string) => {
    pendingRequests.value.delete(requestId);
  };

  // Génère un ID unique pour une requête
  const generateRequestId = () => {
    requestCounter.value++;
    return `req_${requestCounter.value}_${Date.now()}`;
  };

  // Réinitialise tous les trackings (utile pour le debugging)
  const resetAll = () => {
    pendingRequests.value.clear();
  };

  return {
    isLoading,
    pendingCount,
    startRequest,
    endRequest,
    generateRequestId,
    resetAll,
  };
};
