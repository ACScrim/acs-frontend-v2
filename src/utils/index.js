"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsernameExample = exports.getProfileLinkExample = exports.generateCalendarLink = exports.getTournamentLink = exports.getErrorMessage = exports.API_URL = void 0;
exports.shuffleArray = shuffleArray;
exports.API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
/**
 * Helper function to get error message from unknown error type
 */
var getErrorMessage = function (error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'Une erreur inconnue est survenue';
};
exports.getErrorMessage = getErrorMessage;
var getTournamentLink = function (tournament) {
    return "/tournaments/".concat(tournament.id);
};
exports.getTournamentLink = getTournamentLink;
var generateCalendarLink = function (tournament, provider) {
    var _a, _b, _c, _d, _e;
    if (provider === void 0) { provider = 'google'; }
    try {
        if (!tournament.date)
            return "#";
        var start = new Date(tournament.date);
        if (isNaN(start.getTime()))
            return "#";
        // Durée par défaut: 3h
        var end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
        var text = (_a = tournament.name) !== null && _a !== void 0 ? _a : "Tournoi ACS";
        var location_1 = (_d = (_b = tournament.discordChannelName) !== null && _b !== void 0 ? _b : (_c = tournament.game) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : "ACS";
        var details = "Plus d'infos: https://acscrim.fr/tournois/".concat((_e = tournament.id) !== null && _e !== void 0 ? _e : "");
        if (provider === 'google') {
            var format = function (d) {
                return d
                    .toISOString()
                    .replace(/[-:]/g, "")
                    .replace(/\.\d{3}Z$/, "Z");
            };
            var url = new URL("https://www.google.com/calendar/render");
            url.searchParams.set("action", "TEMPLATE");
            url.searchParams.set("text", text);
            url.searchParams.set("location", location_1);
            url.searchParams.set("details", details);
            url.searchParams.set("dates", "".concat(format(start), "/").concat(format(end)));
            return url.toString();
        }
        else if (provider === 'outlook') {
            var format = function (d) { return d.toISOString().replace(/\.\d{3}Z$/, "Z"); };
            var url = new URL("https://outlook.live.com/calendar/0/deeplink/compose");
            url.searchParams.set("subject", text);
            url.searchParams.set("startdt", format(start));
            url.searchParams.set("enddt", format(end));
            url.searchParams.set("body", details);
            url.searchParams.set("location", location_1);
            return url.toString();
        }
    }
    catch (_f) {
        return "#";
    }
};
exports.generateCalendarLink = generateCalendarLink;
function shuffleArray(array) {
    var shuffled = array.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var a = shuffled[i];
        var b = shuffled[j];
        shuffled[i] = b;
        shuffled[j] = a;
    }
    return shuffled;
}
var getProfileLinkExample = function (regex) {
    var _a;
    try {
        // Extraire le domaine du regex
        var domainMatch = regex.match(/https?:\/\/([^\/]+)/);
        if (!domainMatch)
            return null;
        var domain = (_a = domainMatch[1]) === null || _a === void 0 ? void 0 : _a.replace(/\\./g, '.').replace(/\^/g, '').replace(/\$/g, '');
        return "Exemple: https://".concat(domain, "/...");
    }
    catch (_b) {
        return null;
    }
};
exports.getProfileLinkExample = getProfileLinkExample;
var getUsernameExample = function (regex) {
    try {
        // Déterminer le format selon le regex
        if (regex.includes('[A-Za-z]+#\\d\\d\\d\\d')) {
            return 'Exemple: Nom#1234';
        }
        if (regex.includes('[a-zA-Z0-9]') && regex.includes('#')) {
            return 'Exemple: NomUtilisateur#ABC';
        }
        if (regex.includes('[A-Za-z0-9]')) {
            return 'Exemple: Pseudo alphanumérique';
        }
        return null;
    }
    catch (_a) {
        return null;
    }
};
exports.getUsernameExample = getUsernameExample;
