import { NextRequest, NextResponse } from 'next/server';
import { gameStore } from '@/lib/gameStore';

// GET /api/rooms - Get all rooms
export async function GET() {
  try {
    const rooms = gameStore.getAllRooms();
    return NextResponse.json({ rooms: Array.from(rooms.values()) });
  } catch (error) {
    console.error('Get rooms error:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

// POST /api/rooms - Create a new room
export async function POST(request: NextRequest) {
  try {
    const { playerName, isPrivate, password } = await request.json();
    
    if (!playerName) {
      return NextResponse.json({ error: 'Player name is required' }, { status: 400 });
    }

    if (isPrivate && !password) {
      return NextResponse.json({ error: 'Password is required for private rooms' }, { status: 400 });
    }

    const { room, player } = gameStore.createRoom(isPrivate || false, password, playerName);

    return NextResponse.json({ room, player });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
