import type { PiniaPluginContext } from 'pinia';
import { db } from '@/db';

const EXCLUDED_STORES = ['toast'];
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;

// Configuration des champs à exclure par store
const EXCLUDED_FIELDS: Record<string, string[]> = {
  'tournament': ['isLoading'],
  'acs-user': ['isLoading'],
  'acs-playerLevels': ['isLoading'],
  'proposalStore': ['isLoading', 'rawgGames']
};

let preloadedData: Record<string, any> = {};

export function setPreloadedStoreData(data: Record<string, any>) {
  preloadedData = data;
}

function cleanStateForStorage(storeName: string, state: Record<string, any>): Record<string, any> {
  try {
    let cleanedState = { ...state };
    
    // Exclut les champs spécifiés pour ce store
    const excludedFields = EXCLUDED_FIELDS[storeName] || [];
    excludedFields.forEach(field => {
      delete cleanedState[field];
    });
    
    // Sérialise et désérialise pour nettoyer les objets non clonables
    return JSON.parse(JSON.stringify(cleanedState));
  } catch (error) {
    console.error('Erreur lors du nettoyage de l\'état:', error);
    return {};
  }
}

export function indexedDbPlugin({ store }: PiniaPluginContext) {
  if (EXCLUDED_STORES.includes(store.$id)) {
    return;
  }

  const storeKey = `pinia_${store.$id}`;

  const loadFromPreloadedData = () => {
    if (preloadedData[store.$id]) {
      store.$patch(preloadedData[store.$id]);
    }
  };

  loadFromPreloadedData();

  // Sauvegarde dans IndexedDB à chaque changement
  const saveToDb = async (state: Record<string, any>) => {
    try {
      const cleanedState = cleanStateForStorage(store.$id, state);
      
      await db.stores.put({
        id: storeKey,
        storeName: store.$id,
        state: cleanedState,
        timestamp: Date.now()
      });
    } catch (error) {
      console.warn(`Erreur lors de la sauvegarde du store ${store.$id}:`, error);
    }
  };

  store.$subscribe(
    (mutation, state) => {
      saveToDb(state as Record<string, any>);
    },
    { 
      detached: true,
      deep: true
    }
  );
}