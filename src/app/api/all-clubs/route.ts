import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  console.log('GET /api/all-clubs: Received request');
  
  try {
    const clubs = await db.club.findMany({
      orderBy: { name: 'asc' }
    });

    console.log(`GET /api/all-clubs: Found ${clubs.length} clubs`);
    
    return NextResponse.json({ 
      clubs, 
      count: clubs.length 
    });
  } catch (error) {
    console.error('GET /api/all-clubs Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clubs', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
