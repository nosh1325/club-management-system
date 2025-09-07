import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = await params
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Access denied. Only admins can approve/reject events.' 
      }, { status: 403 })
    }

    const { action } = await request.json()

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ 
        error: 'Invalid action. Must be "approve" or "reject".' 
      }, { status: 400 })
    }

   
    const event = await db.event.findUnique({
      where: { id: resolvedParams.eventId },
      include: {
        club: {
          select: { name: true }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ 
        error: 'Event not found' 
      }, { status: 404 })
    }

    
    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'
    
    const updatedEvent = await db.event.update({
      where: { id: resolvedParams.eventId },
      data: { 
        status: newStatus,
        updatedAt: new Date()
      },
      include: {
        club: {
          select: { name: true }
        }
      }
    })

    console.log(`Event "${event.title}" ${action}d by admin ${session.user.email}`)

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
    console.error('Admin event approval API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = await params
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Access denied. Only admins can delete events.' 
      }, { status: 403 })
    }

    
    const event = await db.event.findUnique({
      where: { id: resolvedParams.eventId }
    })

    if (!event) {
      return NextResponse.json({ 
        error: 'Event not found' 
      }, { status: 404 })
    }

    
    await db.event.delete({
      where: { id: resolvedParams.eventId }
    })

    console.log(`Event "${event.title}" deleted by admin ${session.user.email}`)

    return NextResponse.json({ 
      message: 'Event deleted successfully'
    })
  } catch (error) {
    console.error('Admin event deletion API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
