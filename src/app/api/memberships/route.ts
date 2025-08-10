import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'


export async function POST(request: NextRequest) {
  try {
    // Log the request for debugging
    console.log("POST /api/memberships: Processing request");
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log("POST /api/memberships: Unauthorized - No session");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Log authenticated user for debugging
    console.log(`POST /api/memberships: Authenticated as ${session.user.email}`);
    
    const data = await request.json();
    const { clubId, action = 'join' } = data;

    if (!clubId) {
      console.log("POST /api/memberships: Missing clubId");
      return NextResponse.json({ error: 'Missing required clubId' }, { status: 400 })
    }

    // Get user data with more details
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        studentId: true, 
        department: true 
      }
    })

    if (!user) {
      console.log("POST /api/memberships: User not found in database");
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (action === 'join') {
      // Check if already a member
      const existingMembership = await db.membership.findUnique({
        where: { 
          userId_clubId: {
            userId: user.id,
            clubId: clubId
          }
        }
      })

      if (existingMembership) {
        console.log(`POST /api/memberships: User already has membership with status ${existingMembership.status}`);
        return NextResponse.json({ 
          error: 'Already applied or member of this club',
          status: existingMembership.status
        }, { status: 400 })
      }

      // Get club details and leader info
      const club = await db.club.findUnique({
        where: { id: clubId },
        include: {
          leader: {
            select: { name: true, email: true }
          }
        }
      })

      if (!club) {
        console.log(`POST /api/memberships: Club with ID ${clubId} not found`);
        return NextResponse.json({ error: 'Club not found' }, { status: 404 })
      }

      // Create new membership application
      console.log(`Creating new membership: User ${user.id} joining club ${clubId}`);
      const membership = await db.membership.create({
        data: {
          userId: user.id,
          clubId: clubId,
          role: 'MEMBER',
          status: 'PENDING'
        }
      })

      

      console.log("Membership created successfully");
      return NextResponse.json({ 
        message: 'Application submitted successfully',
        membership 
      })
    } else if (action === 'leave') {
      // Remove membership
      await db.membership.delete({
        where: { 
          userId_clubId: {
            userId: user.id,
            clubId: clubId
          }
        }
      })

      return NextResponse.json({ message: 'Left club successfully' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Memberships API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
