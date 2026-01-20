"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var useToastError_1 = require("@/composables/useToastError");
var useLoadingState_1 = require("@/composables/useLoadingState");
var api = axios_1.default.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    fetchOptions: {
        cache: "force-cache",
    }
});
// Initialiser le système de tracking des requêtes
var loadingState = (0, useLoadingState_1.useLoadingState)();
// Map pour associer les configs de requêtes à leurs IDs
var requestIdMap = new WeakMap();
// Interceptor de requête : démarre le tracking
api.interceptors.request.use(function (config) {
    var requestId = loadingState.generateRequestId();
    // Stocker l'ID dans la WeakMap
    requestIdMap.set(config, requestId);
    loadingState.startRequest(requestId);
    return config;
}, function (error) {
    return Promise.reject(error);
});
// Interceptor de réponse : termine le tracking
api.interceptors.response.use(function (response) {
    var requestId = requestIdMap.get(response.config);
    if (requestId) {
        loadingState.endRequest(requestId);
        requestIdMap.delete(response.config);
    }
    return response;
}, function (error) {
    var _a, _b, _c;
    var requestId = error.config ? requestIdMap.get(error.config) : null;
    if (requestId) {
        loadingState.endRequest(requestId);
        if (error.config) {
            requestIdMap.delete(error.config);
        }
    }
    // Ne pas afficher de toast pour les erreurs 401 sur /users/me
    var is401OnUserMe = ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401 && ((_c = (_b = error.config) === null || _b === void 0 ? void 0 : _b.url) === null || _c === void 0 ? void 0 : _c.includes('/users/me'));
    if (!is401OnUserMe) {
        (0, useToastError_1.toastApiError)(error);
    }
    return Promise.reject(error);
});
exports.default = api;
