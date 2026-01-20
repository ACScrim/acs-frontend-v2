"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTablePaginationQueryString = useTablePaginationQueryString;
var vue_1 = require("vue");
var vue_router_1 = require("vue-router");
function clampInt(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
function parsePageFromQuery(query, defaultPage) {
    var raw = Array.isArray(query) ? query[0] : query;
    var n = raw ? Number.parseInt(raw, 10) : Number.NaN;
    if (!Number.isFinite(n) || n < 1)
        return defaultPage;
    return n;
}
function useTablePaginationQueryString(options) {
    var _a, _b, _c, _d;
    if (options === void 0) { options = {}; }
    var param = (_a = options.param) !== null && _a !== void 0 ? _a : 'page';
    var defaultPage = (_b = options.defaultPage) !== null && _b !== void 0 ? _b : 1;
    var cleanDefault = (_c = options.cleanDefault) !== null && _c !== void 0 ? _c : true;
    var defaultPageSize = (_d = options.defaultPageSize) !== null && _d !== void 0 ? _d : 10;
    var route = (0, vue_router_1.useRoute)();
    var router = (0, vue_router_1.useRouter)();
    // TanStack est 0-based: pageIndex=0 => page 1
    // Initialiser immédiatement avec la valeur de l'URL
    var initialPage = clampInt(parsePageFromQuery(route.query[param], defaultPage), 1, Number.MAX_SAFE_INTEGER);
    // Un seul ref contenant l'objet PaginationState complet
    var pagination = (0, vue_1.ref)({
        pageIndex: initialPage - 1,
        pageSize: defaultPageSize,
    });
    var writePageToUrl = function (page1Based) {
        var newQuery = __assign({}, route.query);
        if (cleanDefault && page1Based === defaultPage) {
            delete newQuery[param];
        }
        else {
            newQuery[param] = String(page1Based);
        }
        router.replace({ query: newQuery });
    };
    var onPaginationChange = function (updater) {
        var next = typeof updater === 'function' ? updater(pagination.value) : updater;
        pagination.value = next;
        // Écrire dans l'URL immédiatement après un changement utilisateur
        writePageToUrl(next.pageIndex + 1);
    };
    // Synchroniser quand la route change (back/forward, navigation externe)
    (0, vue_1.watch)(function () { return route.query[param]; }, function (newPageQuery) {
        var page1 = clampInt(parsePageFromQuery(newPageQuery, defaultPage), 1, Number.MAX_SAFE_INTEGER);
        var nextIndex = page1 - 1;
        if (nextIndex !== pagination.value.pageIndex) {
            pagination.value = __assign(__assign({}, pagination.value), { pageIndex: nextIndex });
        }
    });
    return {
        pagination: pagination,
        onPaginationChange: onPaginationChange,
    };
}
