import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

//fetching club data//GET /api/clubs
export async function GET(request: NextRequest) {
  try {
    //search parameters
    const { searchParams } = new URL(request.url); //extracting query parameters
    const search = searchParams.get('search') || ''; //club search
    const statusParam = searchParams.get('status') || 'ACTIVE'; //club data
    
    //session for membership info
    const session = await getServerSession(authOptions); //awaiting authentication
    console.log('Session:', session ? `User: ${session.user?.email}` : 'No session');
    
    // Get user memberships if authenticated
    const membershipMap = new Map<string, string>(); //stores key-value pairs of clubId and membership status

    if (session?.user?.email) {
      try {
        //finding user by email and selecting id and storing their database record
        const user = await db.user.findUnique({
          where: { email: session.user.email },
          select: { id: true }
        });
        
        //finding all memberships of the user and storing club id and status
        if (user) {
          const userMemberships = await db.membership.findMany({ //array of all club memberships
            where: { userId: user.id },
            select: { clubId: true, status: true },
          });

          userMemberships.forEach((membership) => {
            membershipMap.set(membership.clubId, membership.status); //storing each club's membership status
          });
          
         
        } else {
          console.warn(`User not found in database: ${session.user.email}`);
        }
      } catch (error) {
        console.warn('Could not fetch memberships:', error);
      }
    }

    //where clause for filtering clubs
    const whereClause: Record<string, unknown> = {}; //initializing an empty object for search filters
    if (statusParam) { //status filter
      whereClause.status = statusParam;
    }
    if (search) { //search filters using these terms
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { department: { contains: search } },
      ];
    }
    
    //fetching clubs using search filters and include leader name and email
    const clubs = await db.club.findMany({
      where: whereClause,
      include: {
        leader: {
          select: { name: true, email: true }
        },
        _count: {
          select: { 
            memberships: { where: { status: 'ACCEPTED' } }, //counting accepted memberships
            events: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    //processing clubs data and building a clubsWithMembership array
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
