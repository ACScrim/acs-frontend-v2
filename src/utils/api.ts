import axios from "axios";
import { toastApiError } from "@/composables/useToastError";
import { useLoadingState } from "@/composables/useLoadingState";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  fetchOptions: {
    cache: "force-cache",
  }
});

// Initialiser le système de tracking des requêtes
const loadingState = useLoadingState();

// Map pour associer les configs de requêtes à leurs IDs
const requestIdMap = new WeakMap();

// Interceptor de requête : démarre le tracking
api.interceptors.request.use(
  (config) => {
    const requestId = loadingState.generateRequestId();
    // Stocker l'ID dans la WeakMap
    requestIdMap.set(config, requestId);
    loadingState.startRequest(requestId);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de réponse : termine le tracking
api.interceptors.response.use(
  (response) => {
    const requestId = requestIdMap.get(response.config);
    if (requestId) {
      loadingState.endRequest(requestId);
      requestIdMap.delete(response.config);
    }
    return response;
  },
  (error) => {
    const requestId = error.config ? requestIdMap.get(error.config) : null;
    if (requestId) {
      loadingState.endRequest(requestId);
      if (error.config) {
        requestIdMap.delete(error.config);
      }
    }

    // Ne pas afficher de toast pour les erreurs 401 sur /users/me
    const is401OnUserMe = error.response?.status === 401 && error.config?.url?.includes('/users/me');
    if (!is401OnUserMe) {
      toastApiError(error);
    }

    return Promise.reject(error);
  }
);

export default api;
