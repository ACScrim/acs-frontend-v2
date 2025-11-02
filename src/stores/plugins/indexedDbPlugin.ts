import type { PiniaPluginContext } from 'pinia';
import { db } from '@/db';

const EXCLUDED_STORES = ['toast'];
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;

let preloadedData: Record<string, any> = {};

// Fonction publique pour définir les données pré-chargées
export function setPreloadedStoreData(data: Record<string, any>) {
  preloadedData = data;
}

function cleanStateForStorage(state: Record<string, any>): Record<string, any> {
  try {
    return JSON.parse(JSON.stringify(state));
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

  // Charge les données pré-chargées si disponibles
  const loadFromPreloadedData = () => {
    if (preloadedData[store.$id]) {
      store.$patch(preloadedData[store.$id]);
    }
  };

  // Charge au démarrage depuis les données pré-chargées
  loadFromPreloadedData();

  // Sauvegarde dans IndexedDB à chaque changement
  const saveToDb = async (state: Record<string, any>) => {
    try {
      const cleanedState = cleanStateForStorage(state);
      
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

  // S'abonne aux changements
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