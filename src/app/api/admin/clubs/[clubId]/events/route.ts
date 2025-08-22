import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

   
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status') 

   
    let whereCondition: any = {}
    
    if (statusFilter) {
      whereCondition.status = statusFilter
    }

    
    const events = await db.event.findMany({
      where: whereCondition,
      include: {
        club: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            rsvps: true
          }
        }
      },
      orderBy: [
        { status: 'asc' }, 
        { createdAt: 'desc' }
      ]
    })

    console.log(`Admin fetching events: ${events.length} events found, status filter: ${statusFilter || 'all'}`)

    return NextResponse.json({
      success: true,
      events: events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        venue: event.venue,
        startDate: event.startDate?.toISOString(),
        endDate: event.endDate?.toISOString(),
        capacity: event.capacity,
        status: event.status,
        club: {
          id: event.club.id,
          name: event.club.name
        },
        _count: {
          rsvps: event._count.rsvps
        }
      }))
    })

  } catch (error) {
    console.error('Admin events API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
