"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Footer = exports.PageHeader = void 0;
// Export des composants globaux
var PageHeader_vue_1 = require("./PageHeader.vue");
Object.defineProperty(exports, "PageHeader", { enumerable: true, get: function () { return PageHeader_vue_1.default; } });
var Footer_vue_1 = require("./Footer.vue");
Object.defineProperty(exports, "Footer", { enumerable: true, get: function () { return Footer_vue_1.default; } });
// Ici on pourrait ajouter d'autres composants globaux comme :
// export { default as LoadingOverlay } from "./LoadingOverlay.vue";
// export { default as ErrorBoundary } from "./ErrorBoundary.vue";
// export { default as ConfirmDialog } from "./ConfirmDialog.vue";
