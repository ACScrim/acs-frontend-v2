export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code: string;
  };
  meta?: {
    timestamp: string;
    path: string;
    method: string;
  }
}

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

export interface UserWithStats extends User {
  tournamentStats: {
    firstPlaceCount: number;
    secondPlaceCount: number;
    thirdPlaceCount: number;
    top25Count: number;
    tournamentsCount: number;
    points: number;
  };
  tournamentHistory: Tournament[];
  lastActivity: string;
  perGameStats: [{
    game: Pick<Game, 'id' | 'name' | 'imageUrl'>;
    tournamentsCount: number;
    victoriesCount: number;
  }];
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
    user: User;
    inWaitlist: boolean;
    registrationDate: string;
    hasCheckin: boolean;
    isCaster: boolean;
    isMvp: boolean;
    mvpVotes: string[];
  }[];
  playerCap: number;
  teamsPublished: boolean;
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
    users: User[];
    score: number;
    ranking: number;
    id: string;
  }[];
  clips: {
    url: string;
    addedBy?: User;
    addedAt: string;
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

export interface HomeStats {
  tournaments: number,
  users: number,
  gamesPlayed: number
}

export interface LeaderboardEntry {
  ranking: number;
  user: User;
  tournamentsCount: number;
  victoriesCount: number;
  top25Count: number;
  points: number;
}

export interface Season {
  id: string;
  number: number;
  tournaments: Tournament[];
  winner: User | null;
}

export interface GameProposal {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  rawgId: number | null;
  proposedBy: User;
  status: 'pending' | 'approved';
  votes: {
    user: User;
    value: number;
  }[];
  totalVotes: number;
  createdAt: string;
  updatedAt: string;
}