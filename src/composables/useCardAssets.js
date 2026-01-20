"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBackgroundAsset = useBackgroundAsset;
exports.useBorderAsset = useBorderAsset;
var vue_1 = require("vue");
function useBackgroundAsset() {
    return {
        name: (0, vue_1.ref)(''),
        type: (0, vue_1.ref)('solid'),
        solidColor: (0, vue_1.ref)('transparent'),
        gradientColor1: (0, vue_1.ref)('#667eea'),
        gradientColor2: (0, vue_1.ref)('#764ba2'),
        gradientAngle: (0, vue_1.ref)(135),
        imageUrl: (0, vue_1.ref)(''),
        imageBase64: (0, vue_1.ref)(''),
        imagePreview: (0, vue_1.ref)(''),
    };
}
function useBorderAsset() {
    return {
        name: (0, vue_1.ref)(''),
        type: (0, vue_1.ref)('solid'),
        solidColor: (0, vue_1.ref)('transparent'),
        imageUrl: (0, vue_1.ref)(''),
        imageBase64: (0, vue_1.ref)(''),
        imagePreview: (0, vue_1.ref)(''),
    };
}
