import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { Theme } from '@/types';

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
      const theme = JSON.parse(fileContent);
      themes.push(theme);
    }
    
    return NextResponse.json({ themes });
  } catch (error) {
    console.error('Error loading themes:', error);
    return NextResponse.json({ error: 'Failed to load themes' }, { status: 500 });
  }
}
