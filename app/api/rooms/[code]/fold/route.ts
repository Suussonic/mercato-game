import { NextRequest, NextResponse } from 'next/server';
import { gameStore } from '@/lib/gameStore';

// POST /api/rooms/[code]/fold - Fold player
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { playerId } = await request.json();
    
    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    const success = gameStore.foldPlayer(code, playerId);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to fold player' }, { status: 400 });
    }

    const room = gameStore.getRoom(code);
    return NextResponse.json({ room });
  } catch (error) {
    console.error('Fold player error:', error);
    return NextResponse.json({ error: 'Failed to fold player' }, { status: 500 });
  }
}
