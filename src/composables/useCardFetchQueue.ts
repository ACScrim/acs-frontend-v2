import { ref } from 'vue';

interface FetchQueueItem {
  id: string;
  priority: number;
  timestamp: number;
}

/**
 * Composable to manage batched fetching of card data
 * Prevents overwhelming the API with too many simultaneous requests
 */
export function useCardFetchQueue(options: {
  batchSize?: number;
  batchDelay?: number;
  maxConcurrent?: number;
} = {}) {
  const { batchSize = 5, batchDelay = 100, maxConcurrent = 3 } = options;

  const queue = ref<FetchQueueItem[]>([]);
  const processing = ref(false);
  const activeRequests = ref(0);
  const processedIds = new Set<string>(); // Track already queued IDs
  let processingTimer: number | null = null;

  /**
   * Add a card to the fetch queue
   * @param id - Card ID to fetch
   * @param priority - Higher priority cards are fetched first (default: 0)
   */
  const enqueue = (id: string, priority: number = 0) => {
    // Don't add duplicates - use Set for O(1) lookup
    if (processedIds.has(id)) {
      return;
    }

    processedIds.add(id);
    queue.value.push({
      id,
      priority,
      timestamp: Date.now(),
    });

    // Sort by priority (higher first) and timestamp (older first)
    queue.value.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.timestamp - b.timestamp;
    });

    // Start processing if not already
    if (!processing.value && activeRequests.value < maxConcurrent) {
      scheduleProcessing();
    }
  };

  /**
   * Remove a card from the queue
   */
  const dequeue = (id: string) => {
    queue.value = queue.value.filter(item => item.id !== id);
    processedIds.delete(id);
  };

  /**
   * Process the next batch of cards
   */
  const processBatch = async (
    fetchFn: (id: string) => Promise<void>
  ): Promise<void> => {
    if (queue.value.length === 0 || activeRequests.value >= maxConcurrent) {
      processing.value = false;
      return;
    }

    processing.value = true;
    const batch = queue.value.splice(0, batchSize);
    activeRequests.value += batch.length;

    // Process batch concurrently
    await Promise.allSettled(
      batch.map(async (item) => {
        try {
          await fetchFn(item.id);
        } catch (error) {
          console.error(`Failed to fetch card ${item.id}:`, error);
        } finally {
          activeRequests.value--;
        }
      })
    );

    // Continue processing if there are more items
    if (queue.value.length > 0 && activeRequests.value < maxConcurrent) {
      scheduleProcessing();
    } else {
      processing.value = false;
    }
  };

  const scheduleProcessing = () => {
    if (processingTimer !== null) {
      clearTimeout(processingTimer);
    }
    processingTimer = window.setTimeout(() => {
      processing.value = true;
    }, batchDelay);
  };

  /**
   * Clear the entire queue
   */
  const clear = () => {
    queue.value = [];
    processedIds.clear();
    processing.value = false;
    if (processingTimer !== null) {
      clearTimeout(processingTimer);
      processingTimer = null;
    }
  };

  return {
    queue,
    processing,
    activeRequests,
    enqueue,
    dequeue,
    processBatch,
    clear,
  };
}
