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
exports.useCardForm = useCardForm;
var vue_1 = require("vue");
/**
 * Default values for card form fields
 * Single source of truth for initial/reset state
 */
var DEFAULTS = {
    basicInfo: {
        title: '',
        imageUrl: '',
        imageBase64: '',
        categoryId: undefined,
    },
    appearance: {
        titlePosX: 50,
        titlePosY: 10,
        titleAlign: 'center',
        titleWidth: 'w-full',
        titleColor: '#ffffff',
        titleFontSize: 18,
    },
    imageSettings: {
        posX: 50,
        posY: 30,
        scale: 1,
        width: 160,
        height: 160,
        objectFit: 'cover',
        rounded: 0,
        cropX: 50,
        cropY: 50,
    },
    effects: {
        removeImageBg: false,
        holographicEffect: true,
        holographicIntensity: 0.6,
    },
    metadata: {
        rarity: 'common',
        customTexts: [],
    },
    assetSelection: {
        assetCategory: 'background',
        selectedFrontAssetId: undefined,
        selectedBorderAssetId: undefined,
        useCustomFrontAsset: false,
        useCustomBorderAsset: false,
    },
    backgroundAsset: {
        name: '',
        type: 'solid',
        solidColor: 'transparent',
        gradientColor1: '#667eea',
        gradientColor2: '#764ba2',
        gradientAngle: 135,
        imageBase64: '',
        imagePreview: '',
    },
    borderAsset: {
        name: '',
        type: 'solid',
        solidColor: 'transparent',
        imageBase64: '',
        imagePreview: '',
    },
    categoryModal: {
        show: false,
        name: '',
        description: '',
    },
    ui: {
        activeTab: 'basics',
    },
};
/**
 * Composable for managing CardCreator form state
 * Groups scattered refs into logical reactive objects for better organization
 */
function useCardForm() {
    // Create reactive state from defaults
    var basicInfo = (0, vue_1.reactive)(__assign({}, DEFAULTS.basicInfo));
    var appearance = (0, vue_1.reactive)(__assign({}, DEFAULTS.appearance));
    var imageSettings = (0, vue_1.reactive)(__assign({}, DEFAULTS.imageSettings));
    var effects = (0, vue_1.reactive)(__assign({}, DEFAULTS.effects));
    var metadata = (0, vue_1.reactive)({ rarity: DEFAULTS.metadata.rarity, customTexts: [] });
    var assetSelection = (0, vue_1.reactive)(__assign({}, DEFAULTS.assetSelection));
    var backgroundAsset = (0, vue_1.reactive)(__assign({}, DEFAULTS.backgroundAsset));
    var borderAsset = (0, vue_1.reactive)(__assign({}, DEFAULTS.borderAsset));
    var categoryModal = (0, vue_1.reactive)(__assign({}, DEFAULTS.categoryModal));
    var ui = (0, vue_1.reactive)(__assign({}, DEFAULTS.ui));
    // File input refs (cannot be reactive)
    var fileInputRef = (0, vue_1.ref)(null);
    var backgroundAssetImageInputRef = (0, vue_1.ref)(null);
    var borderAssetImageInputRef = (0, vue_1.ref)(null);
    var cardPreviewRef = (0, vue_1.ref)(null);
    var savedCardsContainer = (0, vue_1.ref)(null);
    /**
     * Reset all form fields to initial state
     */
    var resetForm = function () {
        Object.assign(basicInfo, __assign({}, DEFAULTS.basicInfo));
        Object.assign(appearance, __assign({}, DEFAULTS.appearance));
        Object.assign(imageSettings, __assign({}, DEFAULTS.imageSettings));
        Object.assign(effects, __assign({}, DEFAULTS.effects));
        metadata.rarity = DEFAULTS.metadata.rarity;
        metadata.customTexts = [];
        Object.assign(assetSelection, __assign({}, DEFAULTS.assetSelection));
        Object.assign(backgroundAsset, __assign({}, DEFAULTS.backgroundAsset));
        Object.assign(borderAsset, __assign({}, DEFAULTS.borderAsset));
        Object.assign(categoryModal, __assign({}, DEFAULTS.categoryModal));
        Object.assign(ui, __assign({}, DEFAULTS.ui));
    };
    /**
     * Reset only image-related fields
     */
    var resetImageFields = function () {
        basicInfo.imageUrl = '';
        basicInfo.imageBase64 = '';
        Object.assign(imageSettings, __assign({}, DEFAULTS.imageSettings));
    };
    /**
     * Reset current asset data based on category
     */
    var resetCurrentAssetData = function () {
        if (assetSelection.assetCategory === 'background') {
            backgroundAsset.imageBase64 = '';
            backgroundAsset.imagePreview = '';
        }
        else {
            borderAsset.imageBase64 = '';
            borderAsset.imagePreview = '';
        }
    };
    return {
        // State groups
        basicInfo: basicInfo,
        appearance: appearance,
        imageSettings: imageSettings,
        effects: effects,
        metadata: metadata,
        assetSelection: assetSelection,
        backgroundAsset: backgroundAsset,
        borderAsset: borderAsset,
        categoryModal: categoryModal,
        ui: ui,
        // Refs
        fileInputRef: fileInputRef,
        backgroundAssetImageInputRef: backgroundAssetImageInputRef,
        borderAssetImageInputRef: borderAssetImageInputRef,
        cardPreviewRef: cardPreviewRef,
        savedCardsContainer: savedCardsContainer,
        // Methods
        resetForm: resetForm,
        resetImageFields: resetImageFields,
        resetCurrentAssetData: resetCurrentAssetData,
    };
}
