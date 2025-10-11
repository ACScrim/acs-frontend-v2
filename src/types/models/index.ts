export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  discordId: string;
  avatarUrl: string;
  twitchUsername: string;
  twitchSubscriptionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  gameId: string;
  game: Game;
  date: string;
  discordChannelName: string;
  players: {
    id: string;
    userId: string;
    inWaitlist: boolean;
    registrationDate: string;
    hasCheckin: boolean;
    isCaster: boolean;
    isMvp: boolean;
    mvpVotes: string[];
  }[];
  playerCap: number;
  teamPublished: boolean;
  finished: boolean;
  description: string;
  discordReminderDate: string;
  privateReminderDate: string;
  reminderSent: boolean;
  reminderSentPlayers: boolean;
  messageId: string;
  mvpVoteOpen: boolean;
  teams:{
    name: string;
    users: string[];
    score: number;
    ranking: number;
    id: string;
  }[];
}

export interface Game {
  id: string;
  createdAt: string;
  description: string;
  imageUrl: string;
  name: string;
  roles: string[];
  updatedAt: string;
}