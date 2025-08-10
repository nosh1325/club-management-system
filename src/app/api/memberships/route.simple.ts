import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/memberships: Processing request");
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log("POST /api/memberships: No session");
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 })
    }

    console.log(`POST /api/memberships: User ${session.user.email}`);
    
    const data = await request.json();
    const { clubId } = data;

    if (!clubId) {
      return NextResponse.json({ error: 'Missing clubId' }, { status: 400 })
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get club
    const club = await db.club.findUnique({
      where: { id: clubId }
    })

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 })
    }

    // Check existing membership
    const existingMembership = await db.membership.findUnique({
      where: { 
        userId_clubId: { 
          userId: user.id, 
          clubId: clubId 
        } 
      }
    })

    if (existingMembership) {
      return NextResponse.json({ 
        error: `Already ${existingMembership.status.toLowerCase()}` 
      }, { status: 400 })
    }

    // Create membership
    const membership = await db.membership.create({
      data: {
        userId: user.id,
        clubId: clubId,
        status: 'PENDING'
      }
    })

    console.log("Membership created successfully");
    
    return NextResponse.json({ 
      message: 'Request submitted successfully',
      membership: {
        id: membership.id,
        status: membership.status
      }
    })
    
  } catch (error) {
    console.error('Memberships API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const memberships = await db.membership.findMany({
      where: { userId: user.id },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    })

    return NextResponse.json({ memberships })
  } catch (error) {
    console.error('Error fetching memberships:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
