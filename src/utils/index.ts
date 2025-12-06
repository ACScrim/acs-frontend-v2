import type { Tournament } from "@/types/models";

type CalendarProvider = 'google' | 'outlook';

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Helper function to get error message from unknown error type
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Une erreur inconnue est survenue';
};

export const getTournamentLink = (tournament: Tournament) => {
  return `/tournaments/${tournament.id}`;
};

export const generateCalendarLink = (tournament: Tournament, provider: CalendarProvider = 'google') => {
  try {
    if (!tournament.date) return "#";
    const start = new Date(tournament.date);
    if (isNaN(start.getTime())) return "#";

    // Durée par défaut: 3h
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);

    const text = tournament.name ?? "Tournoi ACS";
    const location =
      tournament.discordChannelName ??
      tournament.game?.name ??
      "ACS";
    const details = `Plus d'infos: https://acscrim.fr/tournois/${
      tournament.id ?? ""
    }`;

    if (provider === 'google') {
      const format = (d: Date) =>
        d
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}Z$/, "Z");

      const url = new URL("https://www.google.com/calendar/render");
      url.searchParams.set("action", "TEMPLATE");
      url.searchParams.set("text", text);
      url.searchParams.set("location", location);
      url.searchParams.set("details", details);
      url.searchParams.set("dates", `${format(start)}/${format(end)}`);
      return url.toString();
    } else if (provider === 'outlook') {
      const format = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z");

      const url = new URL("https://outlook.live.com/calendar/0/deeplink/compose");
      url.searchParams.set("subject", text);
      url.searchParams.set("startdt", format(start));
      url.searchParams.set("enddt", format(end));
      url.searchParams.set("body", details);
      url.searchParams.set("location", location);
      return url.toString();
    }
  } catch {
    return "#";
  }
};