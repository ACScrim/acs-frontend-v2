import { db } from '@/db';

export async function initializeStoresFromDB() {
  try {
    const allCachedStores = await db.stores.toArray();
    
    const storeData: Record<string, any> = {};
    
    allCachedStores.forEach(cached => {
      const storeName = cached.storeName;
      const isExpired = Date.now() - cached.timestamp > 7 * 24 * 60 * 60 * 1000;
      
      if (!isExpired) {
        storeData[storeName] = cached.state;
      }
    });
    
    return storeData;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des stores:', error);
    return {};
  }
}