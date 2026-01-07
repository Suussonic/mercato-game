import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join, parse } from 'path';
import { Theme, Arc, Character } from '@/types';

// GET /api/themes - Get all available themes
export async function GET() {
  try {
    const dataDir = join(process.cwd(), 'data');
    const files = await readdir(dataDir);
    
    // Filter only JSON files
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    // Read all JSON files
    const themes: Theme[] = [];
    for (const file of jsonFiles) {
      const filePath = join(dataDir, file);
      const fileContent = await readFile(filePath, 'utf-8');
      const raw = JSON.parse(fileContent);

      // Normalize: support both full Theme and bare Character[] datasets
      const filename = parse(file).name;

      // Case 1: Already a Theme with arcs
      if (raw && Array.isArray(raw.arcs) && typeof raw.name === 'string') {
        themes.push(raw as Theme);
        continue;
      }

      // Case 2: Bare array of characters -> wrap into Theme with single arc "All"
      if (Array.isArray(raw)) {
        const characters: Character[] = raw.filter((c: any) => c && typeof c.name === 'string' && typeof c.imageUrl === 'string');
        const arc: Arc = { name: 'All', characters };
        const theme: Theme = { name: filename, arcs: [arc] };
        themes.push(theme);
        continue;
      }

      // Otherwise, skip invalid format
      console.warn(`Skipping invalid theme file: ${file}`);
    }
    
    return NextResponse.json({ themes });
  } catch (error) {
    console.error('Error loading themes:', error);
    return NextResponse.json({ error: 'Failed to load themes' }, { status: 500 });
  }
}
