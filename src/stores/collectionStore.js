"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var pinia_1 = require("pinia");
var api_ts_1 = require("@/utils/api.ts");
var toastStore_ts_1 = require("@/stores/toastStore.ts");
var useCollectionStore = (0, pinia_1.defineStore)('collection', {
    state: function () { return ({
        collection: null,
        listCardLoaded: [],
        categoriesOverview: [],
        collectionId: ''
    }); },
    getters: {
        cards: function (state) {
            if (!state.collection)
                return [];
            // Create a Map for O(1) lookup instead of O(n) find
            // Note: Pinia getters are cached, so this Map is only created when state.collection changes
            var cardMap = new Map();
            state.collection.cards.forEach(function (card) {
                if (card.frontAsset) {
                    cardMap.set(card.id, card);
                }
            });
            // Map cardIds to cards with O(1) lookup
            return state.collection.cardIds.map(function (id) {
                var card = cardMap.get(id);
                if (card) {
                    return card;
                }
                return {
                    id: id,
                    title: "Carte non chargée",
                    customTexts: [
                        {
                            content: "Si la carte ne se charge pas, essayez de cliquer dessus",
                            posY: 75,
                            posX: 50,
                            align: "center",
                            width: "w-full"
                        }
                    ],
                    rarity: "common",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            });
        }
    },
    actions: {
        fetchCollection: function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_ts_1.default.get('/card-collection/me')];
                        case 1:
                            response = _a.sent();
                            this.collection = response.data.data;
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Erreur lors de la récupération de la collection de cartes.");
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        fetchCategoriesOverview: function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_ts_1.default.get('/card-collection/me/categories-overview')];
                        case 1:
                            response = _a.sent();
                            this.categoriesOverview = response.data.data.categories;
                            this.collectionId = response.data.data.collectionId;
                            return [3 /*break*/, 3];
                        case 2:
                            error_2 = _a.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Erreur lors de la récupération des catégories.");
                            console.error(error_2);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        fetchFullCard: function (collectionId, cardId) {
            return __awaiter(this, void 0, void 0, function () {
                var response, fetched_1, existingCards, found_1, newCards, idx, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_ts_1.default.get("/card-collection/".concat(collectionId, "/cards/").concat(cardId))];
                        case 1:
                            response = _a.sent();
                            if (!this.collection) {
                                (0, toastStore_ts_1.useToastStore)().error("Collection non chargée.");
                                return [2 /*return*/, null];
                            }
                            fetched_1 = response.data.data;
                            existingCards = Array.isArray(this.collection.cards) ? this.collection.cards : [];
                            found_1 = false;
                            newCards = existingCards.map(function (card) {
                                if (String(card.id) === String(cardId)) {
                                    found_1 = true;
                                    return fetched_1;
                                }
                                return card;
                            });
                            if (!found_1) {
                                idx = this.collection.cardIds.indexOf(cardId);
                                if (idx >= 0 && idx <= newCards.length) {
                                    newCards.splice(idx, 0, fetched_1);
                                }
                                else {
                                    newCards.push(fetched_1);
                                }
                            }
                            // Affectation directe pour conserver la réactivité Pinia
                            this.collection.cards = newCards;
                            if (!this.listCardLoaded.includes(cardId)) {
                                this.listCardLoaded.push(cardId);
                            }
                            return [2 /*return*/, fetched_1];
                        case 2:
                            error_3 = _a.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Erreur lors de la récupération de la carte.");
                            return [2 /*return*/, null];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
    }
});
exports.default = useCollectionStore;
