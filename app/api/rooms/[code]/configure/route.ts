import { NextRequest, NextResponse } from 'next/server';
import { gameStore } from '@/lib/gameStore';
import { GameConfig } from '@/types';

// POST /api/rooms/[code]/configure - Configure game
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const config: GameConfig = await request.json();
    
    const success = gameStore.configureGame(code, config);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to configure game' }, { status: 400 });
    }

    const room = gameStore.getRoom(code);
    return NextResponse.json({ room });
  } catch (error) {
    console.error('Configure game error:', error);
    return NextResponse.json({ error: 'Failed to configure game' }, { status: 500 });
  }
}
