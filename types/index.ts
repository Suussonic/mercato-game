export interface Character {
  name: string;
  imageUrl: string;
}

export interface Arc {
  name: string;
  characters: Character[];
}

export interface Theme {
  name: string;
  arcs: Arc[];
}

export interface Player {
  id: string;
  name: string;
  roomCode: string;
  balance: number;
  characters: Character[];
  currentBet: number;
  hasFolded: boolean;
  hasVoted: boolean;
}

export interface Room {
  code: string;
  isPrivate: boolean;
  password?: string;
  hostId: string;
  players: Player[];
  status: 'waiting' | 'configuring' | 'playing' | 'voting' | 'finished';
  config?: GameConfig;
  gameState?: GameState;
}

export interface GameConfig {
  theme: string;
  selectedArcs: string[];
  selectedCharacters: Character[];
  numberOfTurns: number;
  charactersPerPlayer: number;
  turnDuration: number;
  startingBalance: number;
  customTheme?: Theme; // Full theme data for custom themes from localStorage
}

export interface GameState {
  currentTurn: number;
  currentCharacter: Character | null;
  usedCharacters: Character[];
  timerEndTime: number | null;
  votes: Record<string, string>; // voterId -> playerId
  voteTimerEndTime: number | null;
}
