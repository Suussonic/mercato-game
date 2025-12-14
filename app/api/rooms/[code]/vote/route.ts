import { NextRequest, NextResponse } from 'next/server';
import { gameStore } from '@/lib/gameStore';

// POST /api/rooms/[code]/vote - Vote for a player
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { voterId, targetPlayerId } = await request.json();
    
    if (!voterId || !targetPlayerId) {
      return NextResponse.json({ error: 'Voter ID and target player ID are required' }, { status: 400 });
    }

    const success = gameStore.vote(code, voterId, targetPlayerId);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to vote' }, { status: 400 });
    }

    const room = gameStore.getRoom(code);
    return NextResponse.json({ room });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}
