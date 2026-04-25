import { db } from '@/db';
import { isStorePersistenceEnabled } from '@/stores/plugins/indexedDbPlugin';

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function initializeStoresFromDB() {
  try {
    const allCachedStores = await db.stores.toArray();

    const storeData: Record<string, any> = {};
    const staleEntryIds: string[] = [];

    allCachedStores.forEach((cached) => {
      const isExpired = Date.now() - cached.timestamp > CACHE_TTL_MS;
      const isAllowedStore = isStorePersistenceEnabled(cached.storeName);

      if (isExpired || !isAllowedStore) {
        staleEntryIds.push(cached.id);
        return;
      }

      storeData[cached.storeName] = cached.state;
    });

    if (staleEntryIds.length > 0) {
      await db.stores.bulkDelete(staleEntryIds);
    }

    return storeData;
  } catch (error) {
    console.error("Erreur lors de l'initialisation des stores:", error);
    return {};
  }
}