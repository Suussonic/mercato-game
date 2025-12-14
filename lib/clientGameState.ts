'use client';

import { Player, Room, GameConfig } from '@/types';

export class ClientGameState {
  private static PLAYER_KEY = 'mercato_player';
  private static ROOM_CODE_KEY = 'mercato_room_code';

  // Player management (still in localStorage for UI state)
  static savePlayer(player: Player): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.PLAYER_KEY, JSON.stringify(player));
      localStorage.setItem(this.ROOM_CODE_KEY, player.roomCode);
    }
  }

  static getPlayer(): Player | null {
    if (typeof window !== 'undefined') {
      const playerData = localStorage.getItem(this.PLAYER_KEY);
      return playerData ? JSON.parse(playerData) : null;
    }
    return null;
  }

  static getRoomCode(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.ROOM_CODE_KEY);
    }
    return null;
  }

  static clearPlayer(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.PLAYER_KEY);
      localStorage.removeItem(this.ROOM_CODE_KEY);
    }
  }

  // API calls for room management
  static async getRoom(code: string): Promise<Room | null> {
    try {
      const response = await fetch(`/api/rooms/${code}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.room;
    } catch (error) {
      console.error('Failed to fetch room:', error);
      return null;
    }
  }

  static async getAllRooms(): Promise<Room[]> {
    try {
      const response = await fetch('/api/rooms');
      if (!response.ok) return [];
      const data = await response.json();
      return data.rooms;
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      return [];
    }
  }

  static async createRoom(playerName: string, isPrivate: boolean = false, password?: string): Promise<{ room: Room; player: Player } | null> {
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, isPrivate, password }),
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Failed to create room:', error);
      return null;
    }
  }

  static async joinRoom(code: string, playerName: string, password?: string): Promise<{ room: Room; player: Player } | null> {
    try {
      const response = await fetch(`/api/rooms/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, password }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join room');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to join room:', error);
      throw error;
    }
  }

  // Game actions via API
  static async placeBet(roomCode: string, playerId: string, amount: number): Promise<Room | null> {
    try {
      const response = await fetch(`/api/rooms/${roomCode}/bet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, amount }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.room;
    } catch (error) {
      console.error('Failed to place bet:', error);
      return null;
    }
  }

  static async foldPlayer(roomCode: string, playerId: string): Promise<Room | null> {
    try {
      const response = await fetch(`/api/rooms/${roomCode}/fold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.room;
    } catch (error) {
      console.error('Failed to fold player:', error);
      return null;
    }
  }

  static async resolveTurn(roomCode: string): Promise<Room | null> {
    try {
      const response = await fetch(`/api/rooms/${roomCode}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.room;
    } catch (error) {
      console.error('Failed to resolve turn:', error);
      return null;
    }
  }

  static async startVoting(room: Room): Promise<void> {
    // Voting is started automatically by resolveTurn in gameStore
    return;
  }

  static async vote(roomCode: string, voterId: string, targetPlayerId: string): Promise<Room | null> {
    try {
      const response = await fetch(`/api/rooms/${roomCode}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId, targetPlayerId }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.room;
    } catch (error) {
      console.error('Failed to vote:', error);
      return null;
    }
  }

  static async endGame(roomCode: string): Promise<Room | null> {
    try {
      const response = await fetch(`/api/rooms/${roomCode}/endgame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.room;
    } catch (error) {
      console.error('Failed to end game:', error);
      return null;
    }
  }

  static async endVote(roomCode: string): Promise<Room | null> {
    try {
      const response = await fetch(`/api/rooms/${roomCode}/endvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.room;
    } catch (error) {
      console.error('Failed to end vote:', error);
      return null;
    }
  }

  static async configureGame(roomCode: string, config: GameConfig): Promise<Room | null> {
    try {
      const response = await fetch(`/api/rooms/${roomCode}/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.room;
    } catch (error) {
      console.error('Failed to configure game:', error);
      return null;
    }
  }

  static async startGame(roomCode: string): Promise<Room | null> {
    try {
      const response = await fetch(`/api/rooms/${roomCode}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.room;
    } catch (error) {
      console.error('Failed to start game:', error);
      return null;
    }
  }
}
