import { Room, Player, GameConfig, GameState, Character, Theme } from "@/types";

// Themes cache - will be loaded from API
let themesCache: Theme[] = [];

// Global rooms storage that persists across hot reloads
const globalForRooms = globalThis as unknown as {
  rooms: Map<string, Room> | undefined;
};

if (!globalForRooms.rooms) {
  globalForRooms.rooms = new Map();
}

// Global singleton instance shared across all requests
class GameStore {
  private static instance: GameStore;
  private rooms: Map<string, Room>;

  private constructor() {
    // Use global rooms storage
    this.rooms = globalForRooms.rooms!;
  }

  static getInstance(): GameStore {
    if (!GameStore.instance) {
      GameStore.instance = new GameStore();
    }
    return GameStore.instance;
  }

  generateRoomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  generatePlayerId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  createRoom(
    isPrivate: boolean,
    password?: string,
    hostName?: string
  ): { room: Room; player: Player } {
    const code = this.generateRoomCode();
    const hostId = this.generatePlayerId();

    const host: Player = {
      id: hostId,
      name: hostName || "Host",
      roomCode: code,
      balance: 0,
      characters: [],
      currentBet: 0,
      hasFolded: false,
      hasVoted: false,
    };

    const room: Room = {
      code,
      isPrivate,
      password,
      hostId,
      players: [host],
      status: "waiting",
    };

    this.rooms.set(code, room);
    return { room, player: host };
  }

  joinRoom(
    code: string,
    password: string | undefined,
    playerName: string
  ): { success: boolean; room?: Room; player?: Player; error?: string } {
    const room = this.rooms.get(code);

    if (!room) {
      return { success: false, error: "Room not found" };
    }

    if (room.isPrivate && room.password !== password) {
      return { success: false, error: "Invalid password" };
    }

    if (room.status !== "waiting" && room.status !== "configuring") {
      return { success: false, error: "Game already started" };
    }

    const playerId = this.generatePlayerId();
    const player: Player = {
      id: playerId,
      name: playerName,
      roomCode: code,
      balance: 0,
      characters: [],
      currentBet: 0,
      hasFolded: false,
      hasVoted: false,
    };

    room.players.push(player);

    return { success: true, room, player };
  }

  configureGame(roomCode: string, config: GameConfig): boolean {
    const room = this.rooms.get(roomCode);
    if (!room) return false;

    // Initialize player balances
    room.players.forEach((player) => {
      player.balance = config.startingBalance;
    });

    room.config = config;
    // Don't change status here - will change to 'playing' when startGame is called
    return true;
  }

  startGame(roomCode: string): boolean {
    const room = this.rooms.get(roomCode);
    if (!room || !room.config) return false;

    // Need at least 2 players to start
    if (room.players.length < 2) return false;

    // Reset all players to initial state
    room.players.forEach((player) => {
      player.balance = room.config!.startingBalance;
      player.characters = [];
      player.currentBet = 0;
      player.hasFolded = false;
      player.hasVoted = false;
    });

    const gameState: GameState = {
      currentTurn: 1,
      currentCharacter: this.getRandomCharacter(
        room.config.selectedCharacters,
        []
      ),
      usedCharacters: [],
      timerEndTime: Date.now() + room.config.turnDuration * 1000,
      votes: {},
      voteTimerEndTime: null,
    };

    if (gameState.currentCharacter) {
      gameState.usedCharacters.push(gameState.currentCharacter);
    }

    room.gameState = gameState;
    room.status = "playing";
    return true;
  }

  placeBet(roomCode: string, playerId: string, amount: number): boolean {
    const room = this.rooms.get(roomCode);
    if (!room || !room.config) return false;

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return false;

    // Check if amount is valid (must be positive and within balance)
    if (amount < 0 || amount > player.balance || !Number.isFinite(amount))
      return false;

    // Check if player has reached character limit
    if (player.characters.length >= room.config.charactersPerPlayer) {
      return false; // Player can't bet if they have max characters
    }

    player.currentBet = amount;
    return true;
  }

  foldPlayer(roomCode: string, playerId: string): boolean {
    const room = this.rooms.get(roomCode);
    if (!room || !room.config || !room.gameState) return false;

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return false;

    player.hasFolded = true;

    // Check how many players are still in the game (not folded)
    const playersNotFolded = room.players.filter((p) => !p.hasFolded);

    // Case 1: All players folded (0 left) - just skip to next turn
    if (playersNotFolded.length === 0) {
      this.nextTurn(room);
      return true;
    }

    // Case 2: Only 1 player left - they win if they bet, otherwise skip
    if (playersNotFolded.length === 1) {
      const lastPlayer = playersNotFolded[0];
      // Winner only gets character if they placed a bet
      if (lastPlayer.currentBet > 0) {
        lastPlayer.balance -= lastPlayer.currentBet;

        // Only add character if player hasn't reached limit AND currentCharacter exists
        if (
          lastPlayer.characters.length < room.config.charactersPerPlayer &&
          room.gameState.currentCharacter !== null
        ) {
          lastPlayer.characters.push(room.gameState.currentCharacter);
        }
      }
      this.nextTurn(room);
      return true;
    }

    // Nouvelle logique : attendre que tous les joueurs aient agi (misé ou couché)
    // Un joueur a agi s'il a currentBet > 0 OU hasFolded === true
    const allPlayersActed = room.players.every(
      (p) => p.hasFolded || p.currentBet > 0
    );
    if (allPlayersActed) {
      this.resolveTurn(roomCode);
    }
    // Sinon, on attend les autres joueurs
    return true;
  }

  resolveTurn(roomCode: string): void {
    const room = this.rooms.get(roomCode);
    if (!room || !room.gameState || !room.config) return;

    // Check players who haven't folded
    const playersNotFolded = room.players.filter((p) => !p.hasFolded);

    // If only one player hasn't folded
    if (playersNotFolded.length === 1 && room.gameState.currentCharacter) {
      const lastPlayer = playersNotFolded[0];

      // Only give character if this player has bet something
      if (lastPlayer.currentBet > 0) {
        lastPlayer.balance -= lastPlayer.currentBet;

        // Only add character if player hasn't reached limit and currentCharacter exists
        if (
          lastPlayer.characters.length < room.config.charactersPerPlayer &&
          room.gameState.currentCharacter
        ) {
          lastPlayer.characters.push(room.gameState.currentCharacter);
        }
      }
      // If no bet was made, just skip the turn

      this.nextTurn(room);
      return;
    }

    // Get players who have bet (and not folded)
    const activePlayers = room.players.filter(
      (p) => !p.hasFolded && p.currentBet > 0
    );

    if (activePlayers.length === 0) {
      // No one bet, move to next turn
      this.nextTurn(room);
      return;
    }

    // Find highest bet
    const maxBet = Math.max(...activePlayers.map((p) => p.currentBet));
    const winners = activePlayers.filter((p) => p.currentBet === maxBet);

    if (winners.length === 1 && room.gameState.currentCharacter) {
      // Winner gets the character
      const winner = winners[0];
      winner.balance -= winner.currentBet;
      // Only add character if player hasn't reached limit
      if (winner.characters.length < room.config.charactersPerPlayer) {
        winner.characters.push(room.gameState.currentCharacter);
      }
    } else if (winners.length > 1) {
      // Tie, no one gets the character but everyone pays their bet
      winners.forEach((player) => {
        player.balance -= player.currentBet;
      });
    }

    // Reset for next turn
    this.nextTurn(room);
  }

  private nextTurn(room: Room): void {
    if (!room.gameState || !room.config) return;

    // Reset player states
    room.players.forEach((player) => {
      player.currentBet = 0;
      player.hasFolded = false;
    });

    room.gameState.currentTurn++;

    if (room.gameState.currentTurn > room.config.numberOfTurns) {
      // Game ends, start voting
      this.startVoting(room);
    } else {
      // Next character
      const nextChar = this.getRandomCharacter(
        room.config.selectedCharacters,
        room.gameState.usedCharacters
      );

      if (nextChar) {
        room.gameState.currentCharacter = nextChar;
        room.gameState.usedCharacters.push(nextChar);
        room.gameState.timerEndTime =
          Date.now() + room.config.turnDuration * 1000;
      } else {
        // No more characters
        this.startVoting(room);
      }
    }
  }

  startVoting(room: Room): void {
    if (!room.gameState) return;

    room.status = "voting";
    room.gameState.voteTimerEndTime = Date.now() + 60000; // 60 seconds
    room.gameState.votes = {};
    room.players.forEach((p) => (p.hasVoted = false));
  }

  vote(roomCode: string, voterId: string, targetPlayerId: string): boolean {
    const room = this.rooms.get(roomCode);
    if (!room || !room.gameState || room.status !== "voting") return false;

    const voter = room.players.find((p) => p.id === voterId);
    const target = room.players.find((p) => p.id === targetPlayerId);

    if (!voter || !target || voter.hasVoted) return false;

    // Prevent self-voting
    if (voterId === targetPlayerId) return false;

    room.gameState.votes[voterId] = targetPlayerId;
    voter.hasVoted = true;

    // Check if all voted
    if (Object.keys(room.gameState.votes).length === room.players.length) {
      this.endGame(room);
    }

    return true;
  }

  endGame(room: Room): void {
    if (!room.gameState) return;

    // Count votes
    const voteCounts: Record<string, number> = {};
    Object.values(room.gameState.votes).forEach((playerId) => {
      voteCounts[playerId] = (voteCounts[playerId] || 0) + 1;
    });

    room.status = "finished";
  }

  private getRandomCharacter(
    pool: Character[],
    used: Character[]
  ): Character | null {
    const available = pool.filter((c) => !used.find((u) => u.name === c.name));

    if (available.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  }

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code);
  }

  async loadThemes(): Promise<Theme[]> {
    try {
      // Load themes from API (data folder)
      const response = await fetch("/api/themes");
      const data = await response.json();
      const apiThemes = data.themes || [];

      // Load custom themes from localStorage
      let customThemes: Theme[] = [];
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("customDatasets");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            customThemes = this.normalizeCustomThemes(parsed);
          } catch (e) {
            console.error("Failed to parse custom themes:", e);
          }
        }
      }

      // Merge both, custom themes first
      themesCache = [...customThemes, ...apiThemes];
      return themesCache;
    } catch (error) {
      console.error("Failed to load themes:", error);
      return [];
    }
  }

  private normalizeCustomThemes(raw: any): Theme[] {
    if (!Array.isArray(raw)) return [];

    const toCharacters = (items: any): Character[] => {
      if (!Array.isArray(items)) return [];
      return items
        .map((char) => {
          if (!char || typeof char !== "object") return null;
          if (typeof char.name !== "string" || typeof char.imageUrl !== "string") return null;
          return { name: char.name, imageUrl: char.imageUrl } as Character;
        })
        .filter((char): char is Character => Boolean(char));
    };

    return raw
      .map((item) => {
        if (!item || typeof item !== "object") return null;

        // Theme with arcs
        if (typeof item.name === "string" && Array.isArray(item.arcs)) {
          return item as Theme;
        }

        // Dataset with characters
        if (typeof item.name === "string" && Array.isArray(item.characters)) {
          const characters = toCharacters(item.characters);
          return {
            name: item.name,
            arcs: [{ name: "All", characters }],
          } as Theme;
        }

        return null;
      })
      .filter((theme): theme is Theme => Boolean(theme));
  }

  getAvailableThemes(): Theme[] {
    return themesCache;
  }

  setThemes(themes: Theme[]): void {
    themesCache = themes;
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }
}

export const gameStore = GameStore.getInstance();
