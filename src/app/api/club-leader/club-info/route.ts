import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - Fetch club information for the authenticated club leader
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if user is a club leader
    if (session.user.role !== 'CLUB_LEADER') {
      return NextResponse.json(
        { error: 'Access denied. Only club leaders can access this resource.' },
        { status: 403 }
      )
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Find the club that this user leads
    const club = await db.club.findFirst({
      where: { leaderId: user.id },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        department: true,
        email: true,
        phone: true,
        website: true,
        advisor: true,
        vision: true,
        mission: true,
        activities: true,
        status: true
      }
    })

    if (!club) {
      return NextResponse.json(
        { error: 'No club found for this user. You must be assigned as a club leader first.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      club: club
    })

  } catch (error) {
    console.error('Error fetching club info:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

