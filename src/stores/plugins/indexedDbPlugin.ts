import type { PiniaPluginContext } from 'pinia';
import { db } from '@/db';

type StoreState = Record<string, any>;

type PersistedStoreConfig = {
  pick: (state: StoreState) => StoreState;
};

const SAVE_DEBOUNCE_MS = 750;

const PERSISTED_STORE_CONFIG: Record<string, PersistedStoreConfig> = {
  'acs-user': {
    pick: (state) => ({
      user: state.user ?? null,
    }),
  },
  'threeBoxes': {
    pick: (state) => ({
      played: state.played ?? false,
      choice: state.choice ?? null,
      reward: state.reward ?? null,
      credited: state.credited ?? false,
      permutation: state.permutation,
    }),
  },
  'games': {
    pick: (state) => ({
      dailyQuiz: {
        todayAnswer: state.dailyQuiz?.todayAnswer ?? null,
      },
      acsdle: {
        todayGuesses: Array.isArray(state.acsdle?.todayGuesses)
          ? state.acsdle.todayGuesses
          : [],
      },
    }),
  },
  'collection': {
    pick: (state) => ({
      listCardLoaded: Array.isArray(state.listCardLoaded) ? state.listCardLoaded : [],
      collectionId: state.collectionId ?? '',
    }),
  },
};

let preloadedData: Record<string, StoreState> = {};

const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();
const lastSavedPayloads = new Map<string, string>();

export function setPreloadedStoreData(data: Record<string, StoreState>) {
  preloadedData = data;

  Object.entries(data).forEach(([storeId, state]) => {
    const serialized = safeSerialize(state);
    if (serialized !== null) {
      lastSavedPayloads.set(getStoreKey(storeId), serialized);
    }
  });
}

export function isStorePersistenceEnabled(storeId: string) {
  return storeId in PERSISTED_STORE_CONFIG;
}

function getStoreKey(storeId: string) {
  return `pinia_${storeId}`;
}

function safeSerialize(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.warn('Erreur lors de la sérialisation du state persisté:', error);
    return null;
  }
}

function prepareStateForStorage(storeId: string, state: StoreState) {
  const config = PERSISTED_STORE_CONFIG[storeId];
  if (!config) {
    return null;
  }

  const pickedState = config.pick(state);
  const serialized = safeSerialize(pickedState);

  if (serialized === null) {
    return null;
  }

  return {
    cleanedState: JSON.parse(serialized) as StoreState,
    serialized,
  };
}

export function indexedDbPlugin({ store }: PiniaPluginContext) {
  if (!isStorePersistenceEnabled(store.$id)) {
    return;
  }

  const storeKey = getStoreKey(store.$id);

  const loadFromPreloadedData = () => {
    const persistedState = preloadedData[store.$id];
    if (persistedState) {
      store.$patch(persistedState);
    }
  };

  loadFromPreloadedData();

  const flushToDb = async (preparedState: { cleanedState: StoreState; serialized: string }) => {
    try {
      await db.stores.put({
        id: storeKey,
        storeName: store.$id,
        state: preparedState.cleanedState,
        timestamp: Date.now(),
      });

      lastSavedPayloads.set(storeKey, preparedState.serialized);
    } catch (error) {
      console.warn(`Erreur lors de la sauvegarde du store ${store.$id}:`, error);
    }
  };

  const scheduleSave = (state: StoreState) => {
    const preparedState = prepareStateForStorage(store.$id, state);
    if (!preparedState) {
      return;
    }

    if (lastSavedPayloads.get(storeKey) === preparedState.serialized) {
      return;
    }

    const existingTimer = saveTimers.get(storeKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      saveTimers.delete(storeKey);
      void flushToDb(preparedState);
    }, SAVE_DEBOUNCE_MS);

    saveTimers.set(storeKey, timer);
  };

  store.$subscribe(
    (_, state) => {
      scheduleSave(state as StoreState);
    },
    {
      detached: true,
      deep: true,
    }
  );
}