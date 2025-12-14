import { NextResponse } from 'next/server';
import { DragonBallAPI } from '@/customdata/dragonballapi/api';

// GET /api/dragonball/characters - Fetch all Dragon Ball characters
export async function GET() {
  try {
    const characters = await DragonBallAPI.fetchAllCharacters();
    
    // Get filter options
    const races = DragonBallAPI.getUniqueRaces(characters);
    const affiliations = DragonBallAPI.getUniqueAffiliations(characters);

    return NextResponse.json({
      characters,
      filters: {
        races,
        affiliations,
      },
    });
  } catch (error) {
    console.error('Error fetching Dragon Ball characters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Dragon Ball characters' },
      { status: 500 }
    );
  }
}

// POST /api/dragonball/characters - Filter characters
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { races, affiliations, includeTransformations } = body;

    const allCharacters = await DragonBallAPI.fetchAllCharacters();
    
    const filteredCharacters = DragonBallAPI.filterCharacters(allCharacters, {
      races,
      affiliations,
      includeTransformations,
    });

    return NextResponse.json({
      characters: filteredCharacters,
      count: filteredCharacters.length,
    });
  } catch (error) {
    console.error('Error filtering Dragon Ball characters:', error);
    return NextResponse.json(
      { error: 'Failed to filter Dragon Ball characters' },
      { status: 500 }
    );
  }
}
