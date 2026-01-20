"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLoadingState = void 0;
var vue_1 = require("vue");
// Store global pour tracker les requêtes en cours
var pendingRequests = (0, vue_1.ref)(new Set());
var requestCounter = (0, vue_1.ref)(0);
var useLoadingState = function () {
    // Indique s'il y a au moins une requête en cours
    var isLoading = (0, vue_1.computed)(function () { return pendingRequests.value.size > 0; });
    // Nombre total de requêtes en cours
    var pendingCount = (0, vue_1.computed)(function () { return pendingRequests.value.size; });
    // Ajoute une requête au tracking
    var startRequest = function (requestId) {
        pendingRequests.value.add(requestId);
    };
    // Retire une requête du tracking
    var endRequest = function (requestId) {
        pendingRequests.value.delete(requestId);
    };
    // Génère un ID unique pour une requête
    var generateRequestId = function () {
        requestCounter.value++;
        return "req_".concat(requestCounter.value, "_").concat(Date.now());
    };
    // Réinitialise tous les trackings (utile pour le debugging)
    var resetAll = function () {
        pendingRequests.value.clear();
    };
    return {
        isLoading: isLoading,
        pendingCount: pendingCount,
        startRequest: startRequest,
        endRequest: endRequest,
        generateRequestId: generateRequestId,
        resetAll: resetAll,
    };
};
exports.useLoadingState = useLoadingState;
