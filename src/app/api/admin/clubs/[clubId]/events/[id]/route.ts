import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
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
      return NextResponse.json({ error: 'Only admins can approve/reject events' }, { status: 403 })
    }

    const { action } = await request.json()
    
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 })
    }

    const eventId = id

    
    const existingEvent = await db.event.findUnique({
      where: { id: eventId },
      include: {
        club: {
          select: { name: true }
        }
      }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

   
    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'
    
    const updatedEvent = await db.event.update({
      where: { id: eventId },
      data: { status: newStatus },
      include: {
        club: {
          select: { name: true }
        }
      }
    })

    console.log(`Event "${updatedEvent.title}" ${action}d by admin ${user.id}`)

    return NextResponse.json({
      message: `Event ${action}d successfully`,
      event: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        status: updatedEvent.status,
        clubName: updatedEvent.club.name
      }
    })

  } catch (error) {
    console.error('Event approval API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
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
      return NextResponse.json({ error: 'Only admins can edit events' }, { status: 403 })
    }

    const { title, description, venue, startDate, endDate, capacity } = await request.json()
    
   
    if (!title || !venue || !startDate || !endDate) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, venue, startDate, endDate' 
      }, { status: 400 })
    }

    const eventId = id

    
    const existingEvent = await db.event.findUnique({
      where: { id: eventId },
      include: {
        club: {
          select: { name: true }
        }
      }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (end <= start) {
      return NextResponse.json({ 
        error: 'Event end date must be after start date' 
      }, { status: 400 })
    }

    
    const updatedEvent = await db.event.update({
      where: { id: eventId },
      data: {
        title,
        description: description || null,
        venue: venue || null,
        startDate: start,
        endDate: end,
        date: start, 
        capacity: capacity ? parseInt(capacity.toString()) : null
      },
      include: {
        club: {
          select: { name: true }
        }
      }
    })

   

    return NextResponse.json({
      message: 'Event updated successfully',
      event: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        description: updatedEvent.description,
        venue: updatedEvent.venue,
        startDate: updatedEvent.startDate?.toISOString(),
        endDate: updatedEvent.endDate?.toISOString(),
        capacity: updatedEvent.capacity,
        status: updatedEvent.status,
        clubName: updatedEvent.club.name
      }
    })

  } catch (error) {
    console.error('Event update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
