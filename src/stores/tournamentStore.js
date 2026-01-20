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
var tournamentService_1 = require("@/services/tournamentService");
var pinia_1 = require("pinia");
var api_ts_1 = require("@/utils/api.ts");
var userStore_ts_1 = require("@/stores/userStore.ts");
var useTournamentStore = (0, pinia_1.defineStore)('tournament', {
    state: function () { return ({
        tournaments: [],
        isLoading: false,
    }); },
    getters: {
        nextTournaments: function (state) {
            // Cache sorted upcoming tournaments and return first 3
            var upcoming = state.tournaments
                .filter(function (t) { return !t.finished; })
                .sort(function (a, b) { return new Date(a.date).getTime() - new Date(b.date).getTime(); });
            return upcoming.slice(0, 3);
        },
        finishedTournaments: function (state) {
            return state.tournaments
                .filter(function (t) { return t.finished; })
                .sort(function (a, b) { return new Date(b.date).getTime() - new Date(a.date).getTime(); });
        },
        upcomingTournaments: function (state) {
            return state.tournaments
                .filter(function (t) { return !t.finished; })
                .sort(function (a, b) { return new Date(a.date).getTime() - new Date(b.date).getTime(); });
        },
        gamesPlayed: function (state) {
            // Use Set for O(1) lookups instead of Array.includes
            var gameSet = new Set();
            var games = [];
            for (var _i = 0, _a = state.tournaments; _i < _a.length; _i++) {
                var tournament = _a[_i];
                var gameId = tournament.game.id;
                if (!gameSet.has(gameId)) {
                    gameSet.add(gameId);
                    games.push(tournament.game);
                }
            }
            return games;
        },
        getById: function (state) {
            return function (id) { return state.tournaments.find(function (t) { return t.id === id; }); };
        }
    },
    actions: {
        fetchTournaments: function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.isLoading = true;
                            _a = this;
                            return [4 /*yield*/, tournamentService_1.default.getTournaments()];
                        case 1:
                            _a.tournaments = _b.sent();
                            this.isLoading = false;
                            return [2 /*return*/];
                    }
                });
            });
        },
        fetchTournament: function (tournamentId) {
            return __awaiter(this, void 0, void 0, function () {
                var response, tournament, index;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.isLoading = true;
                            return [4 /*yield*/, api_ts_1.default.get("tournaments/".concat(tournamentId))];
                        case 1:
                            response = _a.sent();
                            tournament = response.data.data;
                            index = this.tournaments.findIndex(function (t) { return t.id === tournamentId; });
                            if (index !== -1) {
                                this.tournaments[index] = tournament;
                            }
                            else {
                                this.tournaments.push(tournament);
                            }
                            this.isLoading = false;
                            return [2 /*return*/];
                    }
                });
            });
        },
        registerToTournament: function (tournamentId_1) {
            return __awaiter(this, arguments, void 0, function (tournamentId, registrationType) {
                var updatedTournament, index;
                if (registrationType === void 0) { registrationType = "player"; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.isLoading = true;
                            return [4 /*yield*/, tournamentService_1.default.registerToTournament(tournamentId, registrationType)];
                        case 1:
                            updatedTournament = _a.sent();
                            index = this.tournaments.findIndex(function (t) { return t.id === tournamentId; });
                            if (index !== -1) {
                                this.tournaments[index] = updatedTournament;
                            }
                            this.isLoading = false;
                            return [2 /*return*/];
                    }
                });
            });
        },
        unregisterFromTournament: function (tournamentId) {
            return __awaiter(this, void 0, void 0, function () {
                var updatedTournament, index;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.isLoading = true;
                            return [4 /*yield*/, tournamentService_1.default.unregisterFromTournament(tournamentId)];
                        case 1:
                            updatedTournament = _a.sent();
                            index = this.tournaments.findIndex(function (t) { return t.id === tournamentId; });
                            if (index !== -1) {
                                this.tournaments[index] = updatedTournament;
                            }
                            this.isLoading = false;
                            return [2 /*return*/];
                    }
                });
            });
        },
        addClipToTournament: function (tournamentId, clipUrl) {
            return __awaiter(this, void 0, void 0, function () {
                var updatedTournament, index;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.isLoading = true;
                            return [4 /*yield*/, tournamentService_1.default.addClipToTournament(tournamentId, clipUrl)];
                        case 1:
                            updatedTournament = _a.sent();
                            index = this.tournaments.findIndex(function (t) { return t.id === tournamentId; });
                            if (index !== -1) {
                                this.tournaments[index] = updatedTournament;
                            }
                            this.isLoading = false;
                            return [2 /*return*/];
                    }
                });
            });
        },
        voteMvpInTournament: function (tournamentId, playerId) {
            return __awaiter(this, void 0, void 0, function () {
                var updatedTournament, index;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.isLoading = true;
                            return [4 /*yield*/, tournamentService_1.default.voteMvpInTournament(tournamentId, playerId)];
                        case 1:
                            updatedTournament = _a.sent();
                            index = this.tournaments.findIndex(function (t) { return t.id === tournamentId; });
                            if (index !== -1) {
                                this.tournaments[index] = updatedTournament;
                            }
                            this.isLoading = false;
                            return [2 /*return*/];
                    }
                });
            });
        },
        closeMvpVoteInTournament: function (tournamentId) {
            return __awaiter(this, void 0, void 0, function () {
                var updatedTournament, index;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.isLoading = true;
                            return [4 /*yield*/, tournamentService_1.default.closeMvpVoteInTournament(tournamentId)];
                        case 1:
                            updatedTournament = _a.sent();
                            index = this.tournaments.findIndex(function (t) { return t.id === tournamentId; });
                            if (index !== -1) {
                                this.tournaments[index] = updatedTournament;
                            }
                            this.isLoading = false;
                            return [2 /*return*/];
                    }
                });
            });
        },
        checkinToTournament: function (tournamentId) {
            return __awaiter(this, void 0, void 0, function () {
                var response, updatedTournament, index;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.isLoading = true;
                            return [4 /*yield*/, api_ts_1.default.post("tournaments/".concat(tournamentId, "/checkin"))];
                        case 1:
                            response = _a.sent();
                            updatedTournament = response.data.data;
                            index = this.tournaments.findIndex(function (t) { return t.id === tournamentId; });
                            if (index !== -1) {
                                this.tournaments[index] = updatedTournament;
                            }
                            this.isLoading = false;
                            return [2 /*return*/];
                    }
                });
            });
        },
        checkoutFromTournament: function (tournamentId) {
            return __awaiter(this, void 0, void 0, function () {
                var response, updatedTournament, index;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.isLoading = true;
                            return [4 /*yield*/, api_ts_1.default.post("tournaments/".concat(tournamentId, "/checkout"))];
                        case 1:
                            response = _a.sent();
                            updatedTournament = response.data.data;
                            index = this.tournaments.findIndex(function (t) { return t.id === tournamentId; });
                            if (index !== -1) {
                                this.tournaments[index] = updatedTournament;
                            }
                            this.isLoading = false;
                            return [2 /*return*/];
                    }
                });
            });
        },
        fetchBracketMatches: function (tournamentId) {
            return __awaiter(this, void 0, void 0, function () {
                var e_1;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _d.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_ts_1.default.get("tournaments/".concat(tournamentId, "/challonge-matches"))];
                        case 1: return [2 /*return*/, (_c = (_b = (_a = (_d.sent())) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.data) !== null && _c !== void 0 ? _c : []];
                        case 2:
                            e_1 = _d.sent();
                            return [2 /*return*/, []];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        placeBet: function (tournamentId, matchId, predictedWinner, amount) {
            return __awaiter(this, void 0, void 0, function () {
                var e_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_ts_1.default.post("tournaments/".concat(tournamentId, "/bets"), {
                                    challongeMatchId: matchId,
                                    predictedWinner: predictedWinner,
                                    amount: amount,
                                })];
                        case 1:
                            _a.sent();
                            (0, userStore_ts_1.useUserStore)().fetchUser().then();
                            return [3 /*break*/, 3];
                        case 2:
                            e_2 = _a.sent();
                            throw e_2;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        cancelBet: function (tournamentId, matchId) {
            return __awaiter(this, void 0, void 0, function () {
                var e_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_ts_1.default.delete("tournaments/".concat(tournamentId, "/bets/").concat(matchId))];
                        case 1:
                            _a.sent();
                            (0, userStore_ts_1.useUserStore)().fetchUser().then();
                            return [3 /*break*/, 3];
                        case 2:
                            e_3 = _a.sent();
                            throw e_3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        validateBets: function (tournamentId) {
            return __awaiter(this, void 0, void 0, function () {
                var e_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_ts_1.default.post("tournaments/".concat(tournamentId, "/bets/validate"))];
                        case 1:
                            _a.sent();
                            (0, userStore_ts_1.useUserStore)().fetchUser().then();
                            return [3 /*break*/, 3];
                        case 2:
                            e_4 = _a.sent();
                            throw e_4;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
    },
});
exports.default = useTournamentStore;
