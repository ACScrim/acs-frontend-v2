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
var api_1 = require("@/utils/api");
var pinia_1 = require("pinia");
var toastStore_1 = require("./toastStore");
var useProposalStore = (0, pinia_1.defineStore)('proposalStore', {
    state: function () { return ({
        isLoading: false,
        proposals: [],
        rawgGames: [],
    }); },
    actions: {
        fetchProposals: function () {
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.isLoading = true;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, , 3, 4]);
                            return [4 /*yield*/, api_1.default.get('/proposals')];
                        case 2:
                            response = _a.sent();
                            this.proposals = response.data.data;
                            return [3 /*break*/, 4];
                        case 3:
                            this.isLoading = false;
                            return [7 /*endfinally*/];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
        voteOnProposal: function (id, vote) {
            return __awaiter(this, void 0, void 0, function () {
                var response, updatedProposal, index, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.post('/proposals/vote', { id: id, vote: vote })];
                        case 1:
                            response = _a.sent();
                            updatedProposal = response.data.data;
                            index = this.proposals.findIndex(function (p) { return p.id === id; });
                            if (index !== -1) {
                                this.proposals[index] = updatedProposal;
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            (0, toastStore_1.useToastStore)().error('Error voting on proposal:', error_1.message || error_1);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        sortProposals: function (criteria) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (criteria === 'recent') {
                        this.proposals.sort(function (a, b) { return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); });
                    }
                    else if (criteria === 'old') {
                        this.proposals.sort(function (a, b) { return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); });
                    }
                    else if (criteria === 'popular') {
                        this.proposals.sort(function (a, b) { return b.votes.length - a.votes.length; });
                    }
                    return [2 /*return*/];
                });
            });
        },
        fetchRawgGames: function (query) {
            return __awaiter(this, void 0, void 0, function () {
                var response, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.get('/proposals/rawg-games', {
                                    params: { q: query }
                                })];
                        case 1:
                            response = _a.sent();
                            this.rawgGames = response.data.data;
                            return [3 /*break*/, 3];
                        case 2:
                            error_2 = _a.sent();
                            (0, toastStore_1.useToastStore)().error('Error fetching RAWG games:', error_2.message || error_2);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        submitProposal: function (game, description) {
            return __awaiter(this, void 0, void 0, function () {
                var response, error_3;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _d.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.post('/proposals', {
                                    game: game,
                                    description: description
                                })];
                        case 1:
                            response = _d.sent();
                            this.proposals.unshift(response.data.data);
                            (0, toastStore_1.useToastStore)().success('Proposition soumise avec succès !');
                            return [3 /*break*/, 3];
                        case 2:
                            error_3 = _d.sent();
                            (0, toastStore_1.useToastStore)().error('Erreur lors de la soumission de la proposition.', "".concat(((_b = (_a = error_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || error_3.message, " (").concat(((_c = error_3.response) === null || _c === void 0 ? void 0 : _c.status) || '', ")"));
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
    }
});
exports.default = useProposalStore;
