import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/clubs: Processing request');
    
    // Get search parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const statusParam = searchParams.get('status') || 'ACTIVE';
    
    // Get session for membership info
    const session = await getServerSession(authOptions);
    console.log('Session:', session ? `User: ${session.user?.email}` : 'No session');
    
    // Get user memberships if authenticated
    const membershipMap = new Map<string, string>();
    
    if (session?.user?.email) {
      try {
        // Find user by email first, then get memberships
        const user = await db.user.findUnique({
          where: { email: session.user.email },
          select: { id: true }
        });
        
        if (user) {
          const userMemberships = await db.membership.findMany({
            where: { userId: user.id },
            select: { clubId: true, status: true },
          });

          userMemberships.forEach((membership) => {
            membershipMap.set(membership.clubId, membership.status);
          });
          
          console.log(`Found ${userMemberships.length} memberships for user ${session.user.email}`);
        } else {
          console.warn(`User not found in database: ${session.user.email}`);
        }
      } catch (error) {
        console.warn('Could not fetch memberships:', error);
      }
    }

    // Build where clause
    const whereClause: Record<string, unknown> = {};
    if (statusParam) {
      whereClause.status = statusParam;
    }
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { department: { contains: search } },
      ];
    }
    
    // Fetch clubs
    const clubs = await db.club.findMany({
      where: whereClause,
      include: {
        leader: {
          select: { name: true, email: true }
        },
        _count: {
          select: { 
            memberships: { where: { status: 'ACCEPTED' } },
            events: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Transform clubs data
    const clubsWithMembership = clubs.map((club) => {
      let activities: string[] = [];
      try {
        activities = club.activities ? JSON.parse(club.activities as string) : [];
      } catch {
        activities = typeof club.activities === 'string' ? 
          club.activities.split(', ') : [];
      }

      return {
        id: club.id,
        name: club.name,
        description: club.description,
        category: club.category,
        department: club.department,
        status: club.status,
        logoUrl: club.logoUrl,
        website: club.website,
        email: club.email,
        phone: club.phone,
        advisor: club.advisor,
        foundedYear: club.foundedYear,
        vision: club.vision,
        mission: club.mission,
        activities: activities,
        leaderId: club.leaderId,
        leader: club.leader,
        memberCount: club._count.memberships,
        eventCount: club._count.events,
        membershipStatus: membershipMap.get(club.id) || null,
      };
    });

    console.log(`Returning ${clubsWithMembership.length} clubs`);
    return NextResponse.json({ 
      clubs: clubsWithMembership,
      count: clubsWithMembership.length
    });
  } catch (error) {
    console.error('Clubs API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
