import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  console.log('🔍 Dashboard API called')
  try {
    const session = await getServerSession(authOptions)
    console.log('📊 Session:', { email: session?.user?.email, role: session?.user?.role })
    
    if (!session?.user?.email) {
      console.log('❌ No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true,
        department: true,
        role: true
      }
    })

    console.log('👤 User found:', { id: user?.id, name: user?.name, role: user?.role })

    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's club memberships
    const memberships = await db.membership.findMany({
      where: { 
        userId: user.id,
        status: 'ACCEPTED'
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            description: true,
            _count: {
              select: { memberships: true }
            }
          }
        }
      }
    })

    // For club leaders, get clubs they are leading
    let leadingClubs: any[] = []
    let pendingMemberships = 0
    if (user.role === 'CLUB_LEADER') {
      leadingClubs = await db.club.findMany({
        where: { 
          leaderId: user.id 
        },
        select: {
          id: true,
          name: true,
          description: true,
          _count: {
            select: { 
              memberships: {
                where: { status: 'ACCEPTED' }
              }
            }
          }
        }
      })

      // Get pending memberships for clubs they lead
      pendingMemberships = await db.membership.count({
        where: {
          clubId: { in: leadingClubs.map(club => club.id) },
          status: 'PENDING'
        }
      })
    }

    // Get user's event RSVPs
    const eventRsvps = await db.eventRsvp.findMany({
      where: { 
        userId: user.id,
        status: 'ATTENDING'
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            venue: true,
            startDate: true,
            club: {
              select: { name: true }
            }
          }
        }
      },
      take: 5,
      orderBy: { event: { startDate: 'asc' } }
    })

    // Get pending membership applications (if any)
    const pendingApplications = await db.membership.count({
      where: { 
        userId: user.id,
        status: 'PENDING'
      }
    })

    const dashboardData = {
      user: {
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
        role: user.role
      },
      stats: {
        clubsJoined: memberships.length,
        eventsAttending: eventRsvps.length,
        pendingApplications,
        pendingMemberships: user.role === 'CLUB_LEADER' ? pendingMemberships : undefined
      },
      recentEvents: eventRsvps.map((rsvp: any) => ({
        id: rsvp.event.id,
        title: rsvp.event.title,
        venue: rsvp.event.venue,
        startDate: rsvp.event.startDate.toISOString(),
        clubName: rsvp.event.club.name
      })),
      myClubs: user.role === 'CLUB_LEADER' 
        ? leadingClubs.map((club: any) => ({
            id: club.id,
            name: club.name,
            description: club.description || '',
            memberCount: club._count.memberships,
            role: 'LEADER'
          }))
        : memberships.map((membership: any) => ({
            id: membership.club.id,
            name: membership.club.name,
            description: membership.club.description || '',
            memberCount: membership.club._count.memberships,
            role: membership.role
          }))
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
