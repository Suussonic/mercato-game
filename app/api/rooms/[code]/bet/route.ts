import { NextRequest, NextResponse } from 'next/server';
import { gameStore } from '@/lib/gameStore';

// POST /api/rooms/[code]/bet - Place a bet
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { playerId, amount } = await request.json();
    
    if (!playerId || amount === undefined) {
      return NextResponse.json({ error: 'Player ID and amount are required' }, { status: 400 });
    }

    const success = gameStore.placeBet(code, playerId, amount);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to place bet' }, { status: 400 });
    }

    const room = gameStore.getRoom(code);
    return NextResponse.json({ room });
  } catch (error) {
    console.error('Place bet error:', error);
    return NextResponse.json({ error: 'Failed to place bet' }, { status: 500 });
  }
}
