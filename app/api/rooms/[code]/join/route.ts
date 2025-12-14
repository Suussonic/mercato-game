import { NextRequest, NextResponse } from 'next/server';
import { gameStore } from '@/lib/gameStore';

// POST /api/rooms/[code]/join - Join a room
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { playerName, password } = await request.json();
    
    if (!playerName) {
      return NextResponse.json({ error: 'Player name is required' }, { status: 400 });
    }

    const result = gameStore.joinRoom(code, password, playerName);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to join room' }, { status: 400 });
    }

    return NextResponse.json({ room: result.room, player: result.player });
  } catch (error) {
    console.error('Join room error:', error);
    return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
  }
}
