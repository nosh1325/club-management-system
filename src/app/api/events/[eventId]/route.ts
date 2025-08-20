import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = await params
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, leadingClubs: { select: { id: true } } }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    
    const event = await db.event.findUnique({
      where: { id: resolvedParams.eventId },
      include: {
        club: {
          select: { 
            id: true,
            name: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

  
    const isLeader = user.role === 'ADMIN' || user.leadingClubs.some(club => club.id === event.clubId)
    if (!isLeader) {
      return NextResponse.json({ error: 'You do not have permission to access this event' }, { status: 403 })
    }

    return NextResponse.json({ 
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        venue: event.venue,
        startDate: event.startDate?.toISOString(),
        endDate: event.endDate?.toISOString(),
        capacity: event.capacity,
        requirements: event.requirements,
        clubId: event.clubId,
        club: event.club,
        status: event.status,
        isPublic: event.isPublic
      }
    })
  } catch (error) {
    console.error('Get event API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = await params
  
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true, leadingClubs: { select: { id: true } } }
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const data = await request.json()
  const event = await db.event.findUnique({ where: { id: resolvedParams.eventId } })
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const isLeader = user.role === 'ADMIN' || user.leadingClubs.some(club => club.id === event.clubId)
  if (!isLeader) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const updated = await db.event.update({
    where: { id: resolvedParams.eventId },
    data: {
      title: data.title,
      description: data.description,
      venue: data.venue,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      capacity: data.capacity,
      requirements: data.requirements,
      isPublic: data.isPublic,
      status: data.status,
    }
  })
  return NextResponse.json({ message: 'Event updated', event: updated })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = await params
  
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true, leadingClubs: { select: { id: true } } }
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const event = await db.event.findUnique({ where: { id: resolvedParams.eventId } })
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const isLeader = user.role === 'ADMIN' || user.leadingClubs.some(club => club.id === event.clubId)
  if (!isLeader) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await db.event.delete({ where: { id: resolvedParams.eventId } })
  return NextResponse.json({ message: 'Event deleted' })
}