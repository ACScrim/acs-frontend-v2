"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCardCustomization = useCardCustomization;
exports.useCustomTextManagement = useCustomTextManagement;
var vue_1 = require("vue");
function useCardCustomization() {
    return {
        // Title customization
        titlePosX: (0, vue_1.ref)(50),
        titlePosY: (0, vue_1.ref)(10),
        titleAlign: (0, vue_1.ref)('center'),
        titleWidth: (0, vue_1.ref)('w-full'),
        titleColor: (0, vue_1.ref)('#ffffff'),
        // Image customization
        imagePosX: (0, vue_1.ref)(50),
        imagePosY: (0, vue_1.ref)(30),
        imageScale: (0, vue_1.ref)(1),
        imageWidth: (0, vue_1.ref)(160),
        imageHeight: (0, vue_1.ref)(160),
        imageObjectFit: (0, vue_1.ref)('cover'),
        // Effects
        removeImageBg: (0, vue_1.ref)(false),
        holographicEffect: (0, vue_1.ref)(true),
        holographicIntensity: (0, vue_1.ref)(0.6),
        // Rarity
        rarity: (0, vue_1.ref)('common'),
        // Custom texts
        customTexts: (0, vue_1.ref)([]),
    };
}
function useCustomTextManagement(customTexts) {
    var addCustomText = function () {
        if (customTexts.value.length < 5) {
            customTexts.value.push({
                content: '',
                posX: 50,
                posY: 85,
                align: 'center',
                color: '#ffffff',
                width: 'w-full',
            });
        }
    };
    var removeCustomText = function (index) {
        customTexts.value.splice(index, 1);
    };
    var updateCustomText = function (index, field, value) {
        if (index >= 0 && index < customTexts.value.length) {
            var text = customTexts.value[index];
            if (text) {
                text[field] = value;
            }
        }
    };
    return {
        addCustomText: addCustomText,
        removeCustomText: removeCustomText,
        updateCustomText: updateCustomText,
    };
}
