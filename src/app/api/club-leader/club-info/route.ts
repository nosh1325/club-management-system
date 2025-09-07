import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'


export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

   
    if (session.user.role !== 'CLUB_LEADER') {
      return NextResponse.json(
        { error: 'Access denied. Only club leaders can access this resource.' },
        { status: 403 }
      )
    }

    
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

    
    const userClubs = await db.club.findMany({
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

    
    const membershipClubs = await db.club.findMany({
      where: {
        memberships: {
          some: {
            userId: user.id,
            role: {
              in: ["Club Leader", "President", "Leader"]
            },
            status: "ACCEPTED"
          }
        }
      },
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

    
    const allClubs = [...userClubs, ...membershipClubs]
    const uniqueClubs = allClubs.filter((club, index, self) => 
      index === self.findIndex(c => c.id === club.id)
    )

    if (uniqueClubs.length === 0) {
      
      const debugInfo = await db.user.findUnique({
        where: { id: user.id },
        select: {
          role: true,
          leadingClubs: { select: { id: true, name: true } },
          memberships: {
            select: {
              role: true,
              status: true,
              club: { select: { name: true } }
            }
          }
        }
      })

      return NextResponse.json({
        error: 'No club found for this user. You must be assigned as a club leader first.',
        debug: {
          userRole: debugInfo?.role,
          directClubs: debugInfo?.leadingClubs || [],
          memberships: debugInfo?.memberships || []
        }
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      clubs: uniqueClubs,
      club: uniqueClubs[0] 
    })

  } catch (error) {
    console.error('Error fetching club info:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

