"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useToastError = exports.toastApiError = void 0;
var axios_1 = require("axios");
var toastStore_1 = require("@/stores/toastStore");
var utils_1 = require("@/utils");
var toastApiError = function (error, fallbackMessage) {
    var _a, _b;
    if (fallbackMessage === void 0) { fallbackMessage = "An unexpected error occurred."; }
    try {
        var toastStore = (0, toastStore_1.useToastStore)();
        var backendError = (0, axios_1.isAxiosError)(error)
            ? (_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error
            : undefined;
        var message = (backendError === null || backendError === void 0 ? void 0 : backendError.message) || (0, utils_1.getErrorMessage)(error) || fallbackMessage;
        toastStore.error(message, backendError === null || backendError === void 0 ? void 0 : backendError.code);
    }
    catch (_c) {
        console.warn("Unable to display error toast", error);
    }
};
exports.toastApiError = toastApiError;
var useToastError = function () { return ({ toastApiError: exports.toastApiError }); };
exports.useToastError = useToastError;
