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

export interface Scrimium {
  balance: number;
  transactions: {
    amount: number;
    date: Date;
    description: string;
  }[]
}

export interface ScrimiumAdmin extends Scrimium {
  user: User;
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
  scrimium: Scrimium
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
  challongeUrl?: string;
  challongeTournamentId?: string;
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
  id?: string;
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

export interface DailyQuestion {
  id: string;
  question: string;
  options: string[];
  category: string;
  image?: string;
}

export interface YesterdayDailyQuestion extends DailyQuestion {
  correctAnswer: string;
  userAnswer?: DailyAnswer;
}

export interface DailyAnswer {
  questionId: string;
  userAnswer?: string;
  isCorrect: boolean;
  cheated: boolean;
  discoveredAt?: Date;
  answeredAt?: Date;
  points?: number;
}

export interface WeeklyLeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl: string;
  totalPoints: number;
}

export interface CardAsset {
  id?: string;
  name?: string;
  category: 'background' | 'border';
  type: 'gradient' | 'solid' | 'image';
  color1?: string;
  color2?: string;
  angle?: number;
  solidColor?: string;
  imageBase64?: string;
  imageMimeType?: string;
  createdBy?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface CollectibleCard {
  id: string;
  title: string;
  imageUrl?: string;
  imageBase64?: string;
  imageMimeType?: string;
  frontAssetId?: string;
  frontAsset?: CardAsset;
  borderAssetId?: string;
  borderAsset?: CardAsset;
  categoryId?: string;
  category?: CardCategory;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
  // Personnalisation - Position du titre
  titlePosX?: number;
  titlePosY?: number;
  titleAlign?: 'left' | 'center' | 'right';
  titleWidth?: 'w-full' | 'w-auto';
  // Personnalisation - Effets
  removeImageBg?: boolean;
  holographicEffect?: boolean;
  holographicIntensity?: number;
  // Personnalisation - Couleurs du texte
  titleColor?: string;
  titleFontSize?: number;
  // Personnalisation - Position et échelle de l'image
  imagePosX?: number;
  imagePosY?: number;
  imageScale?: number;
  imageWidth?: number;
  imageHeight?: number;
  imageObjectFit?: 'contain' | 'cover';
  customTexts?: Array<{
    content: string;
    posX: number;
    posY: number;
    align: 'left' | 'center' | 'right';
    color: string;
    width: 'w-full' | 'w-auto';
    fontSize?: number;
  }>;
  status?: 'active' | 'inactive' | 'pending';
  count?: number;
}

export interface CardCollection {
  id: string;
  userId: string;
  user: User;
  cardIds: string[];
  cards: CollectibleCard[]
}

export interface CardCategory {
  id: string;
  name: string;
  description?: string;
  createdBy?: string;
}

export interface BoosterShopItem {
  id: string;
  name: string;
  price: number;
  cardsCount: number;
  description: string;
  epicCardGuarantee: number;
  legendaryCardGuarantee: number;
}


export interface Booster {
  userId: string;
  user: User;
  cards: CollectibleCard[];
  buyDate: Date;
  boosterId: string;
  booster: Booster;
}

export interface AcsdleUser {
  id: string;
  username: string;
  createdAt: Date;
  tournamentsPlayed: number;
  victories: number;
  top25Finishes: number;
  mostPlayedGames: string[];
}

export interface AcsdleCompletion {
  userId: string;
  attempts: AcsdleUser[];
  won: boolean;
  completedAt?: Date;
}

export interface ChallongeBracketSettings {
  tournamentType: 'single elimination' | 'double elimination' | 'round robin' | 'swiss' | 'free for all';
  groupStageEnabled: boolean;
  groupStage?: {
    type?: 'round robin' | 'single elimination' | 'double elimination';
    groupSize?: number;
    participantCountToAdvancePerGroup?: number;
    rrIterations?: number;
    rankedBy?: '' | 'match wins' | 'game wins' | 'game win percentage' | 'points scored' | 'points difference';
  };
  doubleElimination?: {
    splitParticipants?: boolean;
    grandFinalsModifier?: '' | 'skip' | 'single match';
  };
  roundRobin?: {
    iterations?: number;
    ranking?: '' | 'match wins' | 'game wins' | 'game win percentage' | 'points scored' | 'points difference';
    ptsForGameWin?: number;
    ptsForGameTie?: number;
    ptsForMatchWin?: number;
    ptsForMatchTie?: number;
  };
  swiss?: {
    rounds?: number;
    ptsForGameWin?: number;
    ptsForGameTie?: number;
    ptsForMatchWin?: number;
    ptsForMatchTie?: number;
  };
  freeForAll?: {
    maxParticipants?: number;
  };
}

export interface ChallongeBracketResponse {
  challongeUrl: string;
  challongeTournamentId: string;
  bracketUrl: string;
}

export interface Badge {
  id: string;
  tournamentId: string;
  tournament: Tournament;
  type: 'participation' | 'victory' | 'mvp' | 'top25' | 'custom';
}