"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCardCollectionFilters = useCardCollectionFilters;
var vue_1 = require("vue");
var vue_router_1 = require("vue-router");
function useCardCollectionFilters(categories) {
    var router = (0, vue_router_1.useRouter)();
    var route = (0, vue_router_1.useRoute)();
    // État des filtres - pagination
    var currentCategoryIndex = (0, vue_1.ref)(Math.max(0, Math.min(parseInt(route.query.page) || 0, categories().length - 1)));
    // Synchroniser avec l'URL
    var setCurrentCategoryIndex = function (index) {
        currentCategoryIndex.value = Math.max(0, Math.min(index, categories().length - 1));
        router.push({
            query: {
                page: currentCategoryIndex.value.toString()
            }
        });
    };
    // Catégorie actuelle
    var currentCategory = (0, vue_1.computed)(function () {
        var cats = categories();
        return cats[currentCategoryIndex.value] || null;
    });
    // Navigation
    var goToNextCategory = function () {
        if (currentCategoryIndex.value + 1 < categories().length) {
            setCurrentCategoryIndex(currentCategoryIndex.value + 1);
        }
        else {
            setCurrentCategoryIndex(0);
        }
    };
    var goToPreviousCategory = function () {
        if (currentCategoryIndex.value > 0) {
            setCurrentCategoryIndex(currentCategoryIndex.value - 1);
        }
        else {
            setCurrentCategoryIndex(categories().length - 1);
        }
    };
    var goToCategory = function (index) {
        setCurrentCategoryIndex(index);
    };
    var canGoNext = (0, vue_1.computed)(function () { return currentCategoryIndex.value < categories().length - 1; });
    var canGoPrevious = (0, vue_1.computed)(function () { return currentCategoryIndex.value > 0; });
    var totalPages = (0, vue_1.computed)(function () { return categories().length; });
    return {
        currentCategoryIndex: currentCategoryIndex,
        currentCategory: currentCategory,
        goToNextCategory: goToNextCategory,
        goToPreviousCategory: goToPreviousCategory,
        goToCategory: goToCategory,
        canGoNext: canGoNext,
        canGoPrevious: canGoPrevious,
        totalPages: totalPages,
        setCurrentCategoryIndex: setCurrentCategoryIndex
    };
}
