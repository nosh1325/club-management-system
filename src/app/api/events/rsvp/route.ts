import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId, action } = await request.json()

    if (!eventId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user data
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (action === 'rsvp') {
      // Check if already RSVPed
      const existingRsvp = await db.eventRsvp.findUnique({
        where: { 
          userId_eventId: {
            userId: user.id,
            eventId: eventId
          }
        }
      })

      if (existingRsvp) {
        return NextResponse.json({ 
          error: 'Already RSVPed to this event' 
        }, { status: 400 })
      }

      // Check event capacity
      const event = await db.event.findUnique({
        where: { id: eventId },
        include: {
          _count: {
            select: { rsvps: { where: { status: 'ATTENDING' } } }
          }
        }
      })

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }

      if (event.capacity && event._count.rsvps >= event.capacity) {
        return NextResponse.json({ 
          error: 'Event is full' 
        }, { status: 400 })
      }

      // Create RSVP
      const rsvp = await db.eventRsvp.create({
        data: {
          userId: user.id,
          eventId: eventId,
          status: 'ATTENDING'
        }
      })

      return NextResponse.json({ 
        message: 'RSVP created successfully',
        rsvp 
      })
    } else if (action === 'cancel') {
      // Remove RSVP
      await db.eventRsvp.delete({
        where: { 
          userId_eventId: {
            userId: user.id,
            eventId: eventId
          }
        }
      })

      return NextResponse.json({ message: 'RSVP cancelled successfully' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Events RSVP API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
