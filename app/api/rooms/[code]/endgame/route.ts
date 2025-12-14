import { NextRequest, NextResponse } from 'next/server';
import { gameStore } from '@/lib/gameStore';

// POST /api/rooms/[code]/endgame - Force end game immediately
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    
    const room = gameStore.getRoom(code);
    
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.status !== 'playing') {
      return NextResponse.json({ error: 'Game is not in playing phase' }, { status: 400 });
    }

    // Force end game immediately - skip to voting phase
    room.status = 'voting';
    
    if (room.gameState && room.config) {
      // Set vote timer
      room.gameState.voteTimerEndTime = Date.now() + room.config.turnDuration * 1000;
      // Reset votes
      room.gameState.votes = {};
      room.players.forEach(player => {
        player.hasVoted = false;
      });
    }
    
    const updatedRoom = gameStore.getRoom(code);
    return NextResponse.json({ room: updatedRoom });
  } catch (error) {
    console.error('End game error:', error);
    return NextResponse.json({ error: 'Failed to end game' }, { status: 500 });
  }
}
