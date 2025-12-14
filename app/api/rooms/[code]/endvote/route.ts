import { NextRequest, NextResponse } from 'next/server';
import { gameStore } from '@/lib/gameStore';

// POST /api/rooms/[code]/endvote - Force end voting when timer expires
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

    if (room.status !== 'voting') {
      return NextResponse.json({ error: 'Room is not in voting phase' }, { status: 400 });
    }

    // Force end game even if not all players voted
    gameStore.endGame(room);
    
    const updatedRoom = gameStore.getRoom(code);
    return NextResponse.json({ room: updatedRoom });
  } catch (error) {
    console.error('End vote error:', error);
    return NextResponse.json({ error: 'Failed to end vote' }, { status: 500 });
  }
}
