import { NextRequest, NextResponse } from 'next/server';
import { gameStore } from '@/lib/gameStore';

// POST /api/rooms/[code]/resolve - Resolve turn
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    
    gameStore.resolveTurn(code);
    
    const room = gameStore.getRoom(code);
    
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error('Resolve turn error:', error);
    return NextResponse.json({ error: 'Failed to resolve turn' }, { status: 500 });
  }
}
