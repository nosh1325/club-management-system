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

    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Access denied. Only admins can access this resource.' 
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search') || ''

   
    const events = await db.event.findMany({
      where: {
        ...(status && {
          status: status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
        }),
        ...(search && {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
            { venue: { contains: search } }
          ]
        })
      },
      include: {
        club: {
          select: { 
            name: true, 
            id: true
          }
        },
        _count: {
          select: { 
            rsvps: { where: { status: 'ATTENDING' } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const eventsWithFormatting = events.map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      venue: event.venue,
      startDate: event.startDate?.toISOString(),
      endDate: event.endDate?.toISOString(),
      capacity: event.capacity,
      status: event.status,
      club: event.club,
      _count: {
        rsvps: event._count.rsvps
      }
    }))

    return NextResponse.json({ 
      events: eventsWithFormatting,
      total: events.length 
    })
  } catch (error) {
    console.error('Admin events API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
