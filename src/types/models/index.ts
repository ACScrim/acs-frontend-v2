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
    id: string;
    game: Pick<Game, 'id' | 'name' | 'imageUrl'>;
    tournamentsCount: number;
    victoriesCount: number;
  }];
}

export interface UserAdmin extends User {
  reports: Report[];
}

export interface Report {
  id: string;
  userId: string;
  reason: string;
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
  players: TournamentPlayer[];
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
  teams: Team[];
  clips: {
    url: string;
    addedBy?: User;
    addedAt: string;
    id: string;
  }[];
}

export interface TournamentPlayer {
  id: string;
  user: User;
  inWaitlist: boolean;
  registrationDate: string;
  hasCheckin: boolean;
  isCaster: boolean;
  isMvp: boolean;
  mvpVotes: string[];
  tier: string;
  description?: string;
}

export interface Team {
  name: string;
  users: User[];
  score: number;
  ranking: number;
}

export interface Game {
  id: string;
  createdAt: string;
  description: string;
  imageUrl: string;
  name: string;
  roles: { name: string; color: string; id: string; }[];
  updatedAt: string;
  currentPlayerLevel: PlayerGameLevel | null;
  gameProfileLinkRegex?: string;
  gameUsernameRegex?: string;
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

export interface PlayerGameLevel {
  id: string;
  userId: string;
  gameId: string;
  user: User;
  game: Game;
  level: string;
  gameUsername: string;
  isRanked: boolean;
  rank: string;
  selectedRoles: string[];
  comment: string;
  gameProfileLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RawgGame {
  id: number;
  name: string;
  background_image: string | null;
  release_date: string | null;
}

export interface LogEntry {
  level: number,
  time: number,
  pid: number,
  hostname: string,
  reqId: string,
  msg: string,
  method: string,
  url: string,
  body: any,
  statusCode: number,
  user: string
}

export interface TournamentFormData {
  name: string;
  gameId: string;
  date: string;
  playerCap: number;
  description: string;
  discordChannelName: string;
  discordReminderDate: string;
  privateReminderDate: string;
}