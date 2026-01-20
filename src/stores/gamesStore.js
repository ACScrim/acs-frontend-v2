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
var useGamesStore = (0, pinia_1.defineStore)('games', {
    state: function () { return ({
        dailyQuiz: {
            todayQuestion: null,
            yesterdayQuestion: null,
            todayAnswer: null,
            leaderboards: {
                weekly: [],
                lastWeekly: [],
            }
        },
        acsdle: {
            users: [],
            dailyCryptedUser: null,
            todayGuesses: [],
            guessHistory: []
        }
    }); },
    actions: {
        fetchDailyQuestion: function () {
            return __awaiter(this, void 0, void 0, function () {
                var question, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_ts_1.default.get("/games/dailyquiz/today")];
                        case 1:
                            question = (_a.sent()).data.data;
                            this.dailyQuiz.todayQuestion = question;
                            return [3 /*break*/, 3];
                        case 2:
                            e_1 = _a.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Il y a une erreur lors de la récupération de la question du quiz quotidien.", e_1);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        fetchYesterdayDailyQuestion: function () {
            return __awaiter(this, void 0, void 0, function () {
                var question, e_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_ts_1.default.get("/games/dailyquiz/yesterday")];
                        case 1:
                            question = (_a.sent()).data.data;
                            this.dailyQuiz.yesterdayQuestion = question;
                            return [3 /*break*/, 3];
                        case 2:
                            e_2 = _a.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Il y a une erreur lors de la récupération de la question du quiz quotidien d'hier.", e_2);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        fetchTodayDailyAnswer: function () {
            return __awaiter(this, void 0, void 0, function () {
                var answer, e_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_ts_1.default.get("/games/dailyquiz/today-answer")];
                        case 1:
                            answer = (_a.sent()).data.data;
                            this.dailyQuiz.todayAnswer = answer;
                            return [3 /*break*/, 3];
                        case 2:
                            e_3 = _a.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Il y a une erreur lors de la récupération de la réponse du quiz quotidien.", e_3);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        fetchWeeklyLeaderboard: function () {
            return __awaiter(this, void 0, void 0, function () {
                var leaderboard, e_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_ts_1.default.get("/games/dailyquiz/weekly-leaderboard")];
                        case 1:
                            leaderboard = (_a.sent()).data.data;
                            this.dailyQuiz.leaderboards.weekly = leaderboard;
                            return [3 /*break*/, 3];
                        case 2:
                            e_4 = _a.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Il y a une erreur lors de la récupération du classement hebdomadaire du quiz quotidien.", e_4);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        fetchLastWeeklyLeaderboard: function () {
            return __awaiter(this, void 0, void 0, function () {
                var leaderboard, e_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_ts_1.default.get("/games/dailyquiz/last-weekly-leaderboard")];
                        case 1:
                            leaderboard = (_a.sent()).data.data;
                            this.dailyQuiz.leaderboards.lastWeekly = leaderboard;
                            return [3 /*break*/, 3];
                        case 2:
                            e_5 = _a.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Il y a une erreur lors de la récupération du classement de la semaine dernière du quiz quotidien.", e_5);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        updateDailyAnswer: function (questionId, answerData) {
            return __awaiter(this, void 0, void 0, function () {
                var bodyWithoutUndefined, key, answer, e_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            bodyWithoutUndefined = {};
                            for (key in answerData) {
                                if (answerData[key] !== undefined) {
                                    bodyWithoutUndefined[key] = answerData[key];
                                }
                            }
                            return [4 /*yield*/, api_ts_1.default.patch("/games/dailyquiz/answer/".concat(questionId), bodyWithoutUndefined)];
                        case 1:
                            answer = (_a.sent()).data.data;
                            this.dailyQuiz.todayAnswer = answer;
                            return [3 /*break*/, 3];
                        case 2:
                            e_6 = _a.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Il y a une erreur lors de la soumission de la réponse du quiz quotidien.", e_6);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        // Acsdle
        fetchAcsdleUsers: function () {
            return __awaiter(this, void 0, void 0, function () {
                var users, e_7;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_ts_1.default.get("/games/acsdle/users")];
                        case 1:
                            users = (_a.sent()).data.data;
                            this.acsdle.users = users;
                            return [3 /*break*/, 3];
                        case 2:
                            e_7 = _a.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Il y a une erreur lors de la récupération des utilisateurs Acsdle.", e_7);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        fetchAcsdleDailyCryptedUser: function () {
            return __awaiter(this, void 0, void 0, function () {
                var data, e_8;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_ts_1.default.get("/games/acsdle/daily")];
                        case 1:
                            data = (_a.sent()).data.data;
                            this.acsdle.dailyCryptedUser = data;
                            return [3 /*break*/, 3];
                        case 2:
                            e_8 = _a.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Il y a une erreur lors de la récupération de l'utilisateur Acsdle du jour.", e_8);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        fetchAcsdleTodayHistory: function () {
            return __awaiter(this, void 0, void 0, function () {
                var guesses, e_9;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_ts_1.default.get("/games/acsdle/today-history")];
                        case 1:
                            guesses = (_a.sent()).data.data;
                            this.acsdle.todayGuesses = guesses;
                            return [3 /*break*/, 3];
                        case 2:
                            e_9 = _a.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Il y a une erreur lors de la récupération de l'historique Acsdle d'aujourd'hui.", e_9);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        fetchAcsdleHistory: function () {
            return __awaiter(this, void 0, void 0, function () {
                var history_1, e_10;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_ts_1.default.get("/games/acsdle/history")];
                        case 1:
                            history_1 = (_a.sent()).data.data;
                            this.acsdle.guessHistory = history_1;
                            return [3 /*break*/, 3];
                        case 2:
                            e_10 = _a.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Il y a une erreur lors de la récupération de l'historique Acsdle.", e_10);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        addAcsdleTodayGuess: function (user) {
            return __awaiter(this, void 0, void 0, function () {
                var e_11;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, api_ts_1.default.post("/games/acsdle/today-history", {
                                    user: user
                                })];
                        case 1:
                            _a.sent();
                            this.acsdle.todayGuesses.push(user);
                            return [3 /*break*/, 3];
                        case 2:
                            e_11 = _a.sent();
                            (0, toastStore_ts_1.useToastStore)().error("Il y a une erreur lors de l'ajout de votre tentative Acsdle pour aujourd'hui.", e_11);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
    }
});
exports.default = useGamesStore;
