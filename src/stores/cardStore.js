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
var toastStore_ts_1 = require("@/stores/toastStore.ts");
var api_ts_1 = require("@/utils/api.ts");
var useCardStore = (0, pinia_1.defineStore)('cards', {
    state: function () { return ({
        cards: [],
        cardsPreview: [],
        cardAssets: [],
        discordAvatars: [],
        mainCardImages: [],
        loading: false,
    }); },
    actions: {
        fetchCardsPreviews: function () {
            return __awaiter(this, void 0, void 0, function () {
                var cards, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.loading = true;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, 4, 5]);
                            return [4 /*yield*/, api_ts_1.default.get("/games/card-creator/cards")];
                        case 2:
                            cards = (_b.sent()).data.data;
                            this.cardsPreview = cards;
                            return [3 /*break*/, 5];
                        case 3:
                            _a = _b.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Erreur lors de la récupération des cartes.");
                            return [3 /*break*/, 5];
                        case 4:
                            this.loading = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        },
        fetchFullCard: function (cardId) {
            return __awaiter(this, void 0, void 0, function () {
                var card, existingIndex, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.loading = true;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, 4, 5]);
                            return [4 /*yield*/, api_ts_1.default.get("/games/card-creator/cards/".concat(cardId))];
                        case 2:
                            card = (_b.sent()).data.data;
                            existingIndex = this.cards.findIndex(function (c) { return c.id === cardId; });
                            if (existingIndex !== -1) {
                                this.cards[existingIndex] = card;
                            }
                            else {
                                this.cards.push(card);
                            }
                            return [2 /*return*/, card];
                        case 3:
                            _a = _b.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Erreur lors de la récupération de la carte.");
                            return [2 /*return*/, null];
                        case 4:
                            this.loading = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        },
        clearFullCardPreview: function (cardId) {
            this.cards = this.cards.filter(function (c) { return c.id !== cardId; });
        },
        fetchCardAssets: function () {
            return __awaiter(this, void 0, void 0, function () {
                var assets, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.loading = true;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, 4, 5]);
                            return [4 /*yield*/, api_ts_1.default.get("/games/card-creator/assets")];
                        case 2:
                            assets = (_b.sent()).data.data;
                            this.cardAssets = assets;
                            return [3 /*break*/, 5];
                        case 3:
                            _a = _b.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Erreur lors de la récupération des assets.");
                            return [3 /*break*/, 5];
                        case 4:
                            this.loading = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        },
        fetchDiscordAvatars: function () {
            return __awaiter(this, void 0, void 0, function () {
                var avatars, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.loading = true;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, 4, 5]);
                            return [4 /*yield*/, api_ts_1.default.get("/games/card-creator/discord-avatars")];
                        case 2:
                            avatars = (_b.sent()).data.data;
                            this.discordAvatars = avatars;
                            return [3 /*break*/, 5];
                        case 3:
                            _a = _b.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Erreur lors de la récupération des avatars Discord.");
                            return [3 /*break*/, 5];
                        case 4:
                            this.loading = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        },
        fetchMainCardImages: function () {
            return __awaiter(this, void 0, void 0, function () {
                var images, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.loading = true;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, 4, 5]);
                            return [4 /*yield*/, api_ts_1.default.get("/games/card-creator/main-images")];
                        case 2:
                            images = (_b.sent()).data.data;
                            this.mainCardImages = images;
                            return [3 /*break*/, 5];
                        case 3:
                            _a = _b.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Erreur lors de la récupération des images principales des cartes.");
                            return [3 /*break*/, 5];
                        case 4:
                            this.loading = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        },
        fetchUsedMainCardImages: function () {
            return __awaiter(this, void 0, void 0, function () {
                var images, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.loading = true;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, 4, 5]);
                            return [4 /*yield*/, api_ts_1.default.get("/games/card-creator/main-images/used")];
                        case 2:
                            images = (_b.sent()).data.data;
                            this.mainCardImages = images;
                            return [3 /*break*/, 5];
                        case 3:
                            _a = _b.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Erreur lors de la récupération des images utilisées.");
                            return [3 /*break*/, 5];
                        case 4:
                            this.loading = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        },
        // Mock API: Create a new card asset
        createCardAsset: function (assetData) {
            return __awaiter(this, void 0, void 0, function () {
                var asset, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.loading = true;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, 4, 5]);
                            return [4 /*yield*/, api_ts_1.default.post("/games/card-creator/asset", assetData)];
                        case 2:
                            asset = (_b.sent()).data.data;
                            this.cardAssets.push(asset);
                            (0, toastStore_ts_1.useToastStore)().success("Asset créé avec succès !");
                            return [2 /*return*/, asset];
                        case 3:
                            _a = _b.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Erreur lors de la création de l'asset.");
                            return [2 /*return*/, null];
                        case 4:
                            this.loading = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        },
        createCard: function (cardData) {
            return __awaiter(this, void 0, void 0, function () {
                var card, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.loading = true;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, 4, 5]);
                            return [4 /*yield*/, api_ts_1.default.post("/games/card-creator/card", cardData)];
                        case 2:
                            card = (_a.sent()).data.data;
                            this.cards.push(card);
                            (0, toastStore_ts_1.useToastStore)().success("Carte créée avec succès !");
                            return [2 /*return*/, card];
                        case 3:
                            error_1 = _a.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Erreur lors de la création de la carte.");
                            return [2 /*return*/, null];
                        case 4:
                            this.loading = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        },
        deleteCard: function (cardId) {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.loading = true;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 4, 5, 6]);
                            if (!confirm("Êtes-vous sûr de vouloir supprimer cette carte ? Cette action est irréversible.")) return [3 /*break*/, 3];
                            return [4 /*yield*/, api_ts_1.default.delete("/games/card-creator/card/".concat(cardId))];
                        case 2:
                            _b.sent();
                            this.cards = this.cards.filter(function (c) { return c.id !== cardId; });
                            (0, toastStore_ts_1.useToastStore)().success("Carte supprimée avec succès !");
                            _b.label = 3;
                        case 3: return [3 /*break*/, 6];
                        case 4:
                            _a = _b.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Erreur lors de la suppression de la carte.");
                            return [3 /*break*/, 6];
                        case 5:
                            this.loading = false;
                            return [7 /*endfinally*/];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        },
        deleteAsset: function (assetId) {
            return __awaiter(this, void 0, void 0, function () {
                var e_1, message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.loading = true;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, 5, 6]);
                            if (!assetId) {
                                (0, toastStore_ts_1.useToastStore)().error("ID de l'asset invalide.");
                                return [2 /*return*/];
                            }
                            if (!confirm("Êtes-vous sûr de vouloir supprimer cet asset ? Cette action est irréversible.")) return [3 /*break*/, 3];
                            return [4 /*yield*/, api_ts_1.default.delete("/games/card-creator/asset/".concat(assetId))];
                        case 2:
                            _a.sent();
                            this.cardAssets = this.cardAssets.filter(function (a) { return a.id !== assetId; });
                            (0, toastStore_ts_1.useToastStore)().success("Asset supprimé avec succès !");
                            _a.label = 3;
                        case 3: return [3 /*break*/, 6];
                        case 4:
                            e_1 = _a.sent();
                            message = e_1.response.data.message;
                            (0, toastStore_ts_1.useToastStore)().error("Erreur lors de la suppression de l'asset.", message !== null && message !== void 0 ? message : e_1.message);
                            return [3 /*break*/, 6];
                        case 5:
                            this.loading = false;
                            return [7 /*endfinally*/];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        },
        // Get card asset by ID
        getCardAssetById: function (id) {
            return this.cardAssets.find(function (asset) { return asset.id === id; });
        },
        // Get card assets by category
        getCardAssetsByCategory: function (category) {
            return this.cardAssets.filter(function (asset) { return asset.category === category; });
        },
    }
});
exports.default = useCardStore;
