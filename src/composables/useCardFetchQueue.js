"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCardFetchQueue = useCardFetchQueue;
var vue_1 = require("vue");
/**
 * Composable to manage batched fetching of card data
 * Prevents overwhelming the API with too many simultaneous requests
 */
function useCardFetchQueue(options) {
    var _this = this;
    if (options === void 0) { options = {}; }
    var _a = options.batchSize, batchSize = _a === void 0 ? 5 : _a, _b = options.batchDelay, batchDelay = _b === void 0 ? 100 : _b, _c = options.maxConcurrent, maxConcurrent = _c === void 0 ? 3 : _c;
    var queue = (0, vue_1.ref)([]);
    var processing = (0, vue_1.ref)(false);
    var activeRequests = (0, vue_1.ref)(0);
    var processedIds = new Set(); // Track already queued IDs
    var processingTimer = null;
    /**
     * Add a card to the fetch queue
     * @param id - Card ID to fetch
     * @param priority - Higher priority cards are fetched first (default: 0)
     */
    var enqueue = function (id, priority) {
        if (priority === void 0) { priority = 0; }
        // Don't add duplicates - use Set for O(1) lookup
        if (processedIds.has(id)) {
            return;
        }
        processedIds.add(id);
        queue.value.push({
            id: id,
            priority: priority,
            timestamp: Date.now(),
        });
        // Sort by priority (higher first) and timestamp (older first)
        queue.value.sort(function (a, b) {
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }
            return a.timestamp - b.timestamp;
        });
    };
    /**
     * Remove a card from the queue
     */
    var dequeue = function (id) {
        queue.value = queue.value.filter(function (item) { return item.id !== id; });
        processedIds.delete(id);
    };
    /**
     * Process the next batch of cards
     */
    var processBatch = function (fetchFn) { return __awaiter(_this, void 0, void 0, function () {
        var batch;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (queue.value.length === 0 || activeRequests.value >= maxConcurrent) {
                        processing.value = false;
                        return [2 /*return*/];
                    }
                    processing.value = true;
                    batch = queue.value.splice(0, batchSize);
                    activeRequests.value += batch.length;
                    // Process batch concurrently
                    return [4 /*yield*/, Promise.allSettled(batch.map(function (item) { return __awaiter(_this, void 0, void 0, function () {
                            var error_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, 3, 4]);
                                        return [4 /*yield*/, fetchFn(item.id)];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 4];
                                    case 2:
                                        error_1 = _a.sent();
                                        console.error("Failed to fetch card ".concat(item.id, ":"), error_1);
                                        return [3 /*break*/, 4];
                                    case 3:
                                        activeRequests.value--;
                                        return [7 /*endfinally*/];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 1:
                    // Process batch concurrently
                    _a.sent();
                    // Continue processing if there are more items
                    if (queue.value.length > 0 && activeRequests.value < maxConcurrent) {
                        // Set a small delay before next batch
                        if (processingTimer !== null) {
                            clearTimeout(processingTimer);
                        }
                        processingTimer = window.setTimeout(function () {
                            processing.value = true;
                            processBatch(fetchFn);
                        }, batchDelay);
                    }
                    else {
                        processing.value = false;
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    /**
     * Clear the entire queue
     */
    var clear = function () {
        queue.value = [];
        processedIds.clear();
        processing.value = false;
        if (processingTimer !== null) {
            clearTimeout(processingTimer);
            processingTimer = null;
        }
    };
    return {
        queue: queue,
        processing: processing,
        activeRequests: activeRequests,
        enqueue: enqueue,
        dequeue: dequeue,
        processBatch: processBatch,
        clear: clear,
    };
}
