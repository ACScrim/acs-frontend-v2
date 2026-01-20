"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePerformanceMonitor = usePerformanceMonitor;
var vue_1 = require("vue");
/**
 * Composable to monitor component performance
 * Tracks FPS and render times for performance optimization
 */
function usePerformanceMonitor(options) {
    if (options === void 0) { options = {}; }
    var _a = options.enabled, enabled = _a === void 0 ? true : _a, _b = options.logInterval, logInterval = _b === void 0 ? 5000 : _b, _c = options.componentName, componentName = _c === void 0 ? 'Component' : _c;
    var fps = (0, vue_1.ref)(0);
    var renderTime = (0, vue_1.ref)(0);
    var memoryUsage = (0, vue_1.ref)(undefined);
    var frameCount = 0;
    var lastTime = performance.now();
    var rafId = null;
    var logTimer = null;
    var updateFPS = function () {
        frameCount++;
        var currentTime = performance.now();
        var elapsed = currentTime - lastTime;
        if (elapsed >= 1000) {
            fps.value = Math.round((frameCount * 1000) / elapsed);
            frameCount = 0;
            lastTime = currentTime;
        }
        if (enabled) {
            rafId = requestAnimationFrame(updateFPS);
        }
    };
    var measureRenderTime = function (callback) {
        if (!enabled) {
            callback();
            return;
        }
        var start = performance.now();
        callback();
        var end = performance.now();
        renderTime.value = end - start;
    };
    var getMemoryUsage = function () {
        if ('memory' in performance) {
            var memory = performance.memory;
            if (memory && memory.usedJSHeapSize) {
                // Convert to MB
                return Math.round(memory.usedJSHeapSize / 1048576);
            }
        }
        return undefined;
    };
    var logMetrics = function () {
        if (!enabled)
            return;
        memoryUsage.value = getMemoryUsage();
        if (import.meta.env.DEV) {
            console.log("[Performance Monitor - ".concat(componentName, "]"), {
                fps: fps.value,
                renderTime: "".concat(renderTime.value.toFixed(2), "ms"),
                memoryUsage: memoryUsage.value ? "".concat(memoryUsage.value, "MB") : 'N/A',
            });
        }
    };
    (0, vue_1.onMounted)(function () {
        if (enabled) {
            rafId = requestAnimationFrame(updateFPS);
            logTimer = window.setInterval(logMetrics, logInterval);
        }
    });
    (0, vue_1.onUnmounted)(function () {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
        }
        if (logTimer !== null) {
            clearInterval(logTimer);
        }
    });
    return {
        fps: fps,
        renderTime: renderTime,
        memoryUsage: memoryUsage,
        measureRenderTime: measureRenderTime,
    };
}
