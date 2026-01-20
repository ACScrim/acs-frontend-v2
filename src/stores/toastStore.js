"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useToastStore = void 0;
var pinia_1 = require("pinia");
var vue_1 = require("vue");
exports.useToastStore = (0, pinia_1.defineStore)('toast', function () {
    var toasts = (0, vue_1.ref)([]);
    var addToast = function (_a, type, duration) {
        var message = _a.message, details = _a.details;
        if (type === void 0) { type = 'info'; }
        if (duration === void 0) { duration = 3000; }
        var id = Date.now().toString();
        toasts.value.push({
            id: id,
            message: message,
            details: details,
            type: type,
            duration: duration,
        });
    };
    var removeToast = function (id) {
        toasts.value = toasts.value.filter(function (toast) { return toast.id !== id; });
    };
    var success = function (message, details, duration) { return addToast({ message: message, details: details }, 'success', duration); };
    var error = function (message, details, duration) { return addToast({ message: message, details: details }, 'error', duration); };
    var info = function (message, details, duration) { return addToast({ message: message, details: details }, 'info', duration); };
    var warning = function (message, details, duration) { return addToast({ message: message, details: details }, 'warning', duration); };
    return {
        toasts: toasts,
        addToast: addToast,
        removeToast: removeToast,
        success: success,
        error: error,
        info: info,
        warning: warning,
    };
});
