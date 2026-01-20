"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGameColor = getGameColor;
exports.useGameColor = useGameColor;
var vue_1 = require("vue");
var GAME_COLORS = ['#6366F1', '#8B5CF6', '#D946EF', '#EC4899', '#F43F5E', '#F97316', '#EAB308', '#84CC16', '#22C55E', '#10B981', '#14B8A6', '#06B6D4'];
function getGameColor(gameId) {
    var hash = 0;
    for (var i = 0; i < gameId.length; i++) {
        hash = ((hash << 5) - hash) + gameId.charCodeAt(i);
        hash = hash & hash;
    }
    var color = GAME_COLORS[Math.abs(hash) % GAME_COLORS.length];
    return color || '#6366F1';
}
function useGameColor(gameId) {
    return (0, vue_1.computed)(function () { return getGameColor(gameId || 'default'); });
}
