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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("@/utils/api");
var pinia_1 = require("pinia");
var toastStore_1 = require("./toastStore");
var challongeService_1 = require("@/services/challongeService");
var updateOneElementInArray = function (array, element) {
    var index = array.findIndex(function (t) { return t.id === element.id; });
    if (index !== -1) {
        array[index] = element;
    }
    else {
        array.push(element);
    }
};
var useAdminStore = (0, pinia_1.defineStore)('admin', {
    state: function () { return ({
        users: [],
        logs: [],
        tournaments: [],
        playerLevels: [],
        games: [],
        seasons: [],
        proposals: [],
        cards: [],
        scrimiums: [],
        discordDMs: [],
        discordThreads: [],
        discordMeta: { channels: [], members: [] },
        discordDMTotal: 0
    }); },
    getters: {
        getTournaments: function (state) {
            return state.tournaments;
        },
        getTournamentById: function (state) {
            return function (id) { return state.tournaments.find(function (t) { return t.id === id; }); };
        }
    },
    actions: {
        // FETCH ACTIONS
        fetchUsers: function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, usersArray, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.get("/admin/users")];
                        case 1:
                            response = _a.sent();
                            usersArray = response.data.data;
                            this.users = usersArray;
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error fetching all users:", error_1.message || error_1);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        fetchTournaments: function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, tournamentsArray, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.get("/admin/tournaments")];
                        case 1:
                            response = _a.sent();
                            tournamentsArray = response.data.data;
                            this.tournaments = tournamentsArray;
                            return [3 /*break*/, 3];
                        case 2:
                            error_2 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error fetching all tournaments:", error_2.message || error_2);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        fetchTournamentDetails: function (tournamentId) {
            return __awaiter(this, void 0, void 0, function () {
                var response, tournament, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.get("/admin/tournaments/".concat(tournamentId))];
                        case 1:
                            response = _a.sent();
                            tournament = response.data.data;
                            updateOneElementInArray(this.tournaments, tournament);
                            return [3 /*break*/, 3];
                        case 2:
                            error_3 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error fetching tournament details:", error_3.message || error_3);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        fetchPlayerLevels: function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, playerLevelsArray, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.get("/admin/playergamelevels")];
                        case 1:
                            response = _a.sent();
                            playerLevelsArray = response.data.data;
                            this.playerLevels = playerLevelsArray;
                            return [3 /*break*/, 3];
                        case 2:
                            error_4 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error fetching all player levels:", error_4.message || error_4);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        fetchGames: function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, gamesArray, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.get("/admin/games")];
                        case 1:
                            response = _a.sent();
                            gamesArray = response.data.data;
                            this.games = gamesArray;
                            return [3 /*break*/, 3];
                        case 2:
                            error_5 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error fetching all games:", error_5.message || error_5);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        fetchSeasons: function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, seasonsArray, error_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.get("/admin/seasons")];
                        case 1:
                            response = _a.sent();
                            seasonsArray = response.data.data;
                            this.seasons = seasonsArray;
                            return [3 /*break*/, 3];
                        case 2:
                            error_6 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error fetching all seasons:", error_6.message || error_6);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        fetchProposals: function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, proposalsArray, error_7;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.get("/admin/proposals")];
                        case 1:
                            response = _a.sent();
                            proposalsArray = response.data.data;
                            this.proposals = proposalsArray;
                            return [3 /*break*/, 3];
                        case 2:
                            error_7 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error fetching all proposals:", error_7.message || error_7);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        fetchCards: function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, cardsArray, error_8;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.get("/admin/cards")];
                        case 1:
                            response = _a.sent();
                            cardsArray = response.data.data;
                            this.cards = cardsArray;
                            return [3 /*break*/, 3];
                        case 2:
                            error_8 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error fetching all collectible cards:", error_8.message || error_8);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        fetchScrimiums: function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, scrimiumsArray, error_9;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.get("/admin/scrimiums")];
                        case 1:
                            response = _a.sent();
                            scrimiumsArray = response.data.data;
                            this.scrimiums = scrimiumsArray;
                            return [3 /*break*/, 3];
                        case 2:
                            error_9 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error fetching all scrimiums:", error_9.message || error_9);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        fetchDiscordDMs: function () {
            return __awaiter(this, arguments, void 0, function (page, limit) {
                var response, error_10;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.get("/admin/discord/dm?page=".concat(page, "&limit=").concat(limit))];
                        case 1:
                            response = _a.sent();
                            this.discordDMs = response.data.data.items;
                            this.discordDMTotal = response.data.data.total;
                            return [3 /*break*/, 3];
                        case 2:
                            error_10 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error fetching Discord DMs:", error_10.message || error_10);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        fetchDiscordMeta: function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, error_11;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.get('/admin/discord/meta')];
                        case 1:
                            response = _a.sent();
                            this.discordMeta = response.data.data;
                            return [3 /*break*/, 3];
                        case 2:
                            error_11 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error fetching Discord metadata:", error_11.message || error_11);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        fetchDiscordThreads: function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, error_12;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.get('/admin/discord/dm/threads')];
                        case 1:
                            response = _a.sent();
                            this.discordThreads = response.data.data;
                            return [3 /*break*/, 3];
                        case 2:
                            error_12 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error fetching Discord threads:", error_12.message || error_12);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        fetchDiscordConversation: function (discordUserId) {
            return __awaiter(this, void 0, void 0, function () {
                var response, error_13;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.get("/admin/discord/dm/".concat(discordUserId))];
                        case 1:
                            response = _a.sent();
                            this.discordDMs = response.data.data;
                            return [3 /*break*/, 3];
                        case 2:
                            error_13 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error fetching Discord conversation:", error_13.message || error_13);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        fetchLogsHistory: function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, logLines, error_14;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.get("/admin/logs/history")];
                        case 1:
                            response = _a.sent();
                            logLines = response.data.data;
                            this.logs = logLines.map(function (line) { return JSON.parse(line); });
                            this.logs = this.logs.sort(function (a, b) { return b.time - a.time; });
                            return [3 /*break*/, 3];
                        case 2:
                            error_14 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error fetching logs history:", error_14.message || error_14);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        // MODIFY ACTIONS
        addReportToUser: function (userId, reason) {
            return __awaiter(this, void 0, void 0, function () {
                var response, newReport, user_1, error_15;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.post("/reports", { userId: userId, reason: reason })];
                        case 1:
                            response = _a.sent();
                            newReport = response.data.data;
                            user_1 = this.users.find(function (user) { return user.id === userId; });
                            if (user_1) {
                                user_1.reports.push(newReport);
                            }
                            this.users = this.users.map(function (u) { return u.id === userId ? user_1 : u; });
                            return [3 /*break*/, 3];
                        case 2:
                            error_15 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error adding report to user:", error_15.message || error_15);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        removeReport: function (reportId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var user_2, error_16;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.delete("/reports/".concat(reportId))];
                        case 1:
                            _a.sent();
                            user_2 = this.users.find(function (user) { return user.id === userId; });
                            if (user_2) {
                                user_2.reports = user_2.reports.filter(function (report) { return report.id !== reportId; });
                            }
                            this.users = this.users.map(function (u) { return u.id === userId ? user_2 : u; });
                            return [3 /*break*/, 3];
                        case 2:
                            error_16 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error removing report from user:", error_16.message || error_16);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        updateUserRole: function (userId, newRole) {
            return __awaiter(this, void 0, void 0, function () {
                var userIndex, error_17;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.patch("/admin/users/".concat(userId, "/role"), { role: newRole })];
                        case 1:
                            _a.sent();
                            userIndex = this.users.findIndex(function (user) { return user.id === userId; });
                            if (userIndex !== -1) {
                                this.users.find(function (u) { return u.id === userId; }).role = newRole;
                                this.users = __spreadArray([], this.users, true);
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            error_17 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error updating user role:", error_17.message || error_17);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        saveTournamentTeams: function (tournamentId, teamsData) {
            return __awaiter(this, void 0, void 0, function () {
                var response, tournament, error_18;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.post("/admin/tournaments/".concat(tournamentId, "/teams"), { teams: teamsData })];
                        case 1:
                            response = _a.sent();
                            tournament = response.data.data;
                            updateOneElementInArray(this.tournaments, tournament);
                            return [3 /*break*/, 3];
                        case 2:
                            error_18 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error saving tournament teams:", error_18.message || error_18);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        updateTournamentPlayer: function (tournamentId, playerId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var response, tournament, error_19;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.patch("/admin/tournaments/".concat(tournamentId, "/players/").concat(playerId), data)];
                        case 1:
                            response = _a.sent();
                            tournament = response.data.data;
                            updateOneElementInArray(this.tournaments, tournament);
                            return [3 /*break*/, 3];
                        case 2:
                            error_19 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error updating tournament player:", error_19.message || error_19);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        addTournamentPlayer: function (tournamentId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var response, tournament, error_20;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.post("/admin/tournaments/".concat(tournamentId, "/players"), { userId: userId })];
                        case 1:
                            response = _a.sent();
                            tournament = response.data.data;
                            updateOneElementInArray(this.tournaments, tournament);
                            return [3 /*break*/, 3];
                        case 2:
                            error_20 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error adding tournament player:", error_20.message || error_20);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        removeTournamentPlayer: function (tournamentId, playerId) {
            return __awaiter(this, void 0, void 0, function () {
                var response, tournament, error_21;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.delete("/admin/tournaments/".concat(tournamentId, "/players/").concat(playerId))];
                        case 1:
                            response = _a.sent();
                            tournament = response.data.data;
                            updateOneElementInArray(this.tournaments, tournament);
                            return [3 /*break*/, 3];
                        case 2:
                            error_21 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error removing tournament player:", error_21.message || error_21);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        publishTournamentTeams: function (tournamentId, teamsPublished) {
            return __awaiter(this, void 0, void 0, function () {
                var response, tournament, error_22;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.post("/admin/tournaments/".concat(tournamentId, "/publish-teams"), { teamsPublished: teamsPublished })];
                        case 1:
                            response = _a.sent();
                            tournament = response.data.data;
                            updateOneElementInArray(this.tournaments, tournament);
                            return [3 /*break*/, 3];
                        case 2:
                            error_22 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error publishing tournament teams:", error_22.message || error_22);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        updateTeamDetails: function (tournamentId, teamId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var response, tournament;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, api_1.default.patch("/admin/tournaments/".concat(tournamentId, "/teams"), __assign({ oldName: teamId }, data))];
                        case 1:
                            response = _a.sent();
                            tournament = response.data.data;
                            updateOneElementInArray(this.tournaments, tournament);
                            return [2 /*return*/];
                    }
                });
            });
        },
        updateTournament: function (tournamentId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var response, updatedTournament, error_23;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.patch("/admin/tournaments/".concat(tournamentId), data)];
                        case 1:
                            response = _a.sent();
                            updatedTournament = response.data.data;
                            updateOneElementInArray(this.tournaments, updatedTournament);
                            return [3 /*break*/, 3];
                        case 2:
                            error_23 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error updating tournament:", error_23.message || error_23);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        createTournament: function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var response, newTournament, error_24;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.post("/admin/tournaments", data)];
                        case 1:
                            response = _a.sent();
                            newTournament = response.data.data;
                            updateOneElementInArray(this.tournaments, newTournament);
                            return [3 /*break*/, 3];
                        case 2:
                            error_24 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error creating tournament:", error_24.message || error_24);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        deleteTournament: function (tournamentId) {
            return __awaiter(this, void 0, void 0, function () {
                var error_25;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.delete("/admin/tournaments/".concat(tournamentId))];
                        case 1:
                            _a.sent();
                            this.tournaments = this.tournaments.filter(function (t) { return t.id !== tournamentId; });
                            return [3 /*break*/, 3];
                        case 2:
                            error_25 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error deleting tournament:", error_25.message || error_25);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        // GAME ACTIONS
        createGame: function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var response, newGame, error_26;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.post("/admin/games", data)];
                        case 1:
                            response = _a.sent();
                            newGame = response.data.data;
                            updateOneElementInArray(this.games, newGame);
                            return [3 /*break*/, 3];
                        case 2:
                            error_26 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error creating game:", error_26.message || error_26);
                            throw error_26;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        updateGame: function (gameId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var response, updatedGame, error_27;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.patch("/admin/games/".concat(gameId), data)];
                        case 1:
                            response = _a.sent();
                            updatedGame = response.data.data;
                            updateOneElementInArray(this.games, updatedGame);
                            return [3 /*break*/, 3];
                        case 2:
                            error_27 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error updating game:", error_27.message || error_27);
                            throw error_27;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        deleteGame: function (gameId) {
            return __awaiter(this, void 0, void 0, function () {
                var error_28;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.delete("/admin/games/".concat(gameId))];
                        case 1:
                            _a.sent();
                            this.games = this.games.filter(function (g) { return g.id !== gameId; });
                            return [3 /*break*/, 3];
                        case 2:
                            error_28 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error deleting game:", error_28.message || error_28);
                            throw error_28;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        // SEASON ACTIONS
        createSeason: function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var response, newSeason, error_29;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.post("/admin/seasons", data)];
                        case 1:
                            response = _a.sent();
                            newSeason = response.data.data;
                            updateOneElementInArray(this.seasons, newSeason);
                            return [3 /*break*/, 3];
                        case 2:
                            error_29 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error creating season:", error_29.message || error_29);
                            throw error_29;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        updateSeason: function (seasonId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var response, updatedSeason, error_30;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.patch("/admin/seasons/".concat(seasonId), data)];
                        case 1:
                            response = _a.sent();
                            updatedSeason = response.data.data;
                            updateOneElementInArray(this.seasons, updatedSeason);
                            return [3 /*break*/, 3];
                        case 2:
                            error_30 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error updating season:", error_30.message || error_30);
                            throw error_30;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        deleteSeason: function (seasonId) {
            return __awaiter(this, void 0, void 0, function () {
                var error_31;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.delete("/admin/seasons/".concat(seasonId))];
                        case 1:
                            _a.sent();
                            this.seasons = this.seasons.filter(function (s) { return s.id !== seasonId; });
                            return [3 /*break*/, 3];
                        case 2:
                            error_31 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error deleting season:", error_31.message || error_31);
                            throw error_31;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        // Cards ACTIONS
        approveCard: function (cardId) {
            return __awaiter(this, void 0, void 0, function () {
                var response, updatedCard, error_32;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.post("/admin/cards/".concat(cardId, "/approve"), {})];
                        case 1:
                            response = _a.sent();
                            updatedCard = response.data.data;
                            updateOneElementInArray(this.cards, updatedCard);
                            this.fetchCards().then(function (_) { });
                            return [3 /*break*/, 3];
                        case 2:
                            error_32 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error updating card status:", error_32.message || error_32);
                            throw error_32;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        rejectCard: function (cardId) {
            return __awaiter(this, void 0, void 0, function () {
                var response, updatedCard, error_33;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.post("/admin/cards/".concat(cardId, "/reject"), {})];
                        case 1:
                            response = _a.sent();
                            updatedCard = response.data.data;
                            updateOneElementInArray(this.cards, updatedCard);
                            this.fetchCards().then(function (_) { });
                            return [3 /*break*/, 3];
                        case 2:
                            error_33 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error updating card status:", error_33.message || error_33);
                            throw error_33;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        updateCard: function (cardId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var response, updatedCard, error_34;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.patch("/admin/cards/".concat(cardId), data)];
                        case 1:
                            response = _a.sent();
                            updatedCard = response.data.data;
                            updateOneElementInArray(this.cards, updatedCard);
                            this.fetchCards().then(function (_) { });
                            return [2 /*return*/, updatedCard];
                        case 2:
                            error_34 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error updating card:", error_34.message || error_34);
                            throw error_34;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        // LOGS ACTIONS
        addLog: function (logLine) {
            var log = JSON.parse(logLine);
            if (this.logs.length < 50) {
                if (!this.logs.find(function (l) { return l.reqId === log.reqId && l.time === log.time; }))
                    this.logs.push(log);
            }
            else {
                this.logs.pop();
                if (!this.logs.find(function (l) { return l.reqId === log.reqId && l.time === log.time; }))
                    this.logs.push(log);
            }
            this.logs = this.logs.sort(function (a, b) { return b.time - a.time; });
        },
        // PROPOSAL ACTIONS
        rejectProposal: function (proposalId) {
            return __awaiter(this, void 0, void 0, function () {
                var error_35;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.delete("/admin/proposals/".concat(proposalId))];
                        case 1:
                            _a.sent();
                            this.proposals = this.proposals.filter(function (p) { return p.id !== proposalId; });
                            return [3 /*break*/, 3];
                        case 2:
                            error_35 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error rejecting proposal:", error_35.message || error_35);
                            throw error_35;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        finalizeTournamentResults: function (tournamentId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var response, tournament, error_36;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.post("/admin/tournaments/".concat(tournamentId, "/results"), data)];
                        case 1:
                            response = _a.sent();
                            tournament = response.data.data;
                            updateOneElementInArray(this.tournaments, tournament);
                            return [2 /*return*/, tournament];
                        case 2:
                            error_36 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error finalizing tournament results:", error_36.message || error_36);
                            throw error_36;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        // SCRIMIUM ACTIONS
        updateScrimiumBalance: function (userId, amount, action) {
            return __awaiter(this, void 0, void 0, function () {
                var response, updatedScrimium, index, error_37;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.post("/admin/scrimiums/".concat(userId), { amount: amount, action: action })];
                        case 1:
                            response = _a.sent();
                            updatedScrimium = response.data.data;
                            index = this.scrimiums.findIndex(function (s) { return s.user.id === userId; });
                            if (index !== -1) {
                                this.scrimiums[index] = __assign(__assign({}, this.scrimiums[index]), updatedScrimium);
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            error_37 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error updating scrimium balance:", error_37.message || error_37);
                            throw error_37;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        // CHALLONGE BRACKET ACTIONS
        createChallongeBracket: function (tournamentId, settings) {
            return __awaiter(this, void 0, void 0, function () {
                var bracketResponse, error_38;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, challongeService_1.default.createBracket(tournamentId, settings)];
                        case 1:
                            bracketResponse = _a.sent();
                            return [4 /*yield*/, this.fetchTournamentDetails(tournamentId)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, bracketResponse];
                        case 3:
                            error_38 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error creating Challonge bracket:", error_38.message || error_38);
                            throw error_38;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
        sendDiscordMessage: function (payload) {
            return __awaiter(this, void 0, void 0, function () {
                var error_39;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_1.default.post("/admin/discord/send", payload)];
                        case 1:
                            _a.sent();
                            (0, toastStore_1.useToastStore)().success("Message Discord envoyé");
                            return [3 /*break*/, 3];
                        case 2:
                            error_39 = _a.sent();
                            (0, toastStore_1.useToastStore)().error("Error sending Discord message:", error_39.message || error_39);
                            throw error_39;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
    }
});
exports.default = useAdminStore;
