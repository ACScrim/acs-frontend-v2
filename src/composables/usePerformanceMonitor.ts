import { ref, onMounted, onUnmounted } from 'vue';

export interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  memoryUsage?: number;
}

/**
 * Composable to monitor component performance
 * Tracks FPS and render times for performance optimization
 */
export function usePerformanceMonitor(options: {
  enabled?: boolean;
  logInterval?: number;
  componentName?: string;
} = {}) {
  const { enabled = true, logInterval = 5000, componentName = 'Component' } = options;

  const fps = ref(0);
  const renderTime = ref(0);
  const memoryUsage = ref<number | undefined>(undefined);

  let frameCount = 0;
  let lastTime = performance.now();
  let rafId: number | null = null;
  let logTimer: number | null = null;

  const updateFPS = () => {
    frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - lastTime;

    if (elapsed >= 1000) {
      fps.value = Math.round((frameCount * 1000) / elapsed);
      frameCount = 0;
      lastTime = currentTime;
    }

    if (enabled) {
      rafId = requestAnimationFrame(updateFPS);
    }
  };

  const measureRenderTime = (callback: () => void) => {
    if (!enabled) {
      callback();
      return;
    }

    const start = performance.now();
    callback();
    const end = performance.now();
    renderTime.value = end - start;
  };

  const getMemoryUsage = (): number | undefined => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory && memory.usedJSHeapSize) {
        // Convert to MB
        return Math.round(memory.usedJSHeapSize / 1048576);
      }
    }
    return undefined;
  };

  const logMetrics = () => {
    if (!enabled) return;

    memoryUsage.value = getMemoryUsage();

    if (import.meta.env.DEV) {
      console.log(`[Performance Monitor - ${componentName}]`, {
        fps: fps.value,
        renderTime: `${renderTime.value.toFixed(2)}ms`,
        memoryUsage: memoryUsage.value ? `${memoryUsage.value}MB` : 'N/A',
      });
    }
  };

  onMounted(() => {
    if (enabled) {
      rafId = requestAnimationFrame(updateFPS);
      logTimer = window.setInterval(logMetrics, logInterval);
    }
  });

  onUnmounted(() => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    if (logTimer !== null) {
      clearInterval(logTimer);
    }
  });

  return {
    fps,
    renderTime,
    memoryUsage,
    measureRenderTime,
  };
}
