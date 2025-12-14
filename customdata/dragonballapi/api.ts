import { DragonBallCharacter, DragonBallAPIResponse } from './types';
import { Character } from '@/types';

const API_BASE_URL = 'https://dragonball-api.com/api';

export class DragonBallAPI {
  /**
   * Fetch all characters from Dragon Ball API
   */
  static async fetchAllCharacters(): Promise<DragonBallCharacter[]> {
    try {
      const allCharacters: DragonBallCharacter[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await fetch(`${API_BASE_URL}/characters?page=${currentPage}&limit=100`);
        if (!response.ok) {
          throw new Error(`Failed to fetch characters: ${response.statusText}`);
        }

        const data: DragonBallAPIResponse = await response.json();
        
        // Fetch individual character details to get transformations
        const charactersWithTransformations = await Promise.all(
          data.items.map(async (char) => {
            try {
              const detailResponse = await fetch(`${API_BASE_URL}/characters/${char.id}`);
              if (detailResponse.ok) {
                return await detailResponse.json();
              }
              return char; // Fallback to basic data if detail fetch fails
            } catch (error) {
              console.error(`Failed to fetch details for character ${char.id}:`, error);
              return char;
            }
          })
        );
        
        allCharacters.push(...charactersWithTransformations);

        // Check if there are more pages
        hasMorePages = currentPage < data.meta.totalPages;
        currentPage++;
      }

      return allCharacters;
    } catch (error) {
      console.error('Error fetching Dragon Ball characters:', error);
      throw error;
    }
  }

  /**
   * Convert Dragon Ball API character to game Character format
   */
  static convertToGameCharacter(dbChar: DragonBallCharacter, isTransformation: boolean = false, transformationIndex?: number): Character {
    if (isTransformation && transformationIndex !== undefined) {
      const transformation = dbChar.transformations[transformationIndex];
      return {
        name: transformation.name,
        imageUrl: transformation.image,
      };
    }

    return {
      name: dbChar.name,
      imageUrl: dbChar.image,
    };
  }

  /**
   * Get all characters including transformations as separate entries
   */
  static flattenCharactersWithTransformations(characters: DragonBallCharacter[]): Character[] {
    const flattened: Character[] = [];

    characters.forEach(char => {
      // Add base character
      flattened.push(this.convertToGameCharacter(char));

      // Add all transformations as separate characters
      char.transformations.forEach((_, index) => {
        flattened.push(this.convertToGameCharacter(char, true, index));
      });
    });

    return flattened;
  }

  /**
   * Get unique races from characters
   */
  static getUniqueRaces(characters: DragonBallCharacter[]): string[] {
    const races = new Set<string>();
    characters.forEach(char => {
      if (char.race) races.add(char.race);
    });
    return Array.from(races).sort();
  }

  /**
   * Get unique affiliations from characters
   */
  static getUniqueAffiliations(characters: DragonBallCharacter[]): string[] {
    const affiliations = new Set<string>();
    characters.forEach(char => {
      if (char.affiliation) affiliations.add(char.affiliation);
    });
    return Array.from(affiliations).sort();
  }

  /**
   * Filter characters by criteria
   */
  static filterCharacters(
    characters: DragonBallCharacter[],
    filters: {
      races?: string[];
      affiliations?: string[];
      includeTransformations?: boolean;
    }
  ): Character[] {
    let filtered = characters;

    // Filter by race
    if (filters.races && filters.races.length > 0) {
      filtered = filtered.filter(char => filters.races!.includes(char.race));
    }

    // Filter by affiliation
    if (filters.affiliations && filters.affiliations.length > 0) {
      filtered = filtered.filter(char => filters.affiliations!.includes(char.affiliation));
    }

    // Convert to game characters
    if (filters.includeTransformations) {
      return this.flattenCharactersWithTransformations(filtered);
    } else {
      return filtered.map(char => this.convertToGameCharacter(char));
    }
  }
}
