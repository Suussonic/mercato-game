import { NextRequest, NextResponse } from 'next/server';
import { gameStore } from '@/lib/gameStore';

// POST /api/rooms/[code]/start - Start game
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    
    const success = gameStore.startGame(code);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to start game' }, { status: 400 });
    }

    const room = gameStore.getRoom(code);
    return NextResponse.json({ room });
  } catch (error) {
    console.error('Start game error:', error);
    return NextResponse.json({ error: 'Failed to start game' }, { status: 500 });
  }
}
