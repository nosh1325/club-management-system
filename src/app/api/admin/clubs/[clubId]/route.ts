import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'


// PUT - Update club details
export async function PUT(
  request: NextRequest,
  { params }: { params: { clubId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { clubId } = params
    const body = await request.json()
    const { name, description, department, status, foundedYear, vision, mission } = body

    if (!clubId) {
      return NextResponse.json(
        { error: 'Club ID is required.' },
        { status: 400 }
      )
    }

    // Basic validation
    if (!name || !department) {
      return NextResponse.json(
        { error: 'Name and department are required.' },
        { status: 400 }
      )
    }

    // Check if club exists
    const existingClub = await db.club.findUnique({
      where: { id: clubId }
    })

    if (!existingClub) {
      return NextResponse.json(
        { error: 'Club not found.' },
        { status: 404 }
      )
    }

    // Check if another club with the same name exists (excluding current club)
    const duplicateClub = await db.club.findFirst({
      where: { 
        name: { equals: name, mode: 'insensitive' },
        NOT: { id: clubId }
      }
    })

    if (duplicateClub) {
      return NextResponse.json(
        { error: 'A club with this name already exists.' },
        { status: 400 }
      )
    }

    // Update the club
    const updatedClub = await db.club.update({
      where: { id: clubId },
      data: {
        name,
        description: description || '',
        department,
        status: status || 'PENDING',
        foundedYear: foundedYear ? parseInt(foundedYear) : null,
        vision: vision || '',
        mission: mission || '',
        updatedAt: new Date()
      },
      include: {
        leader: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            memberships: true,
            events: true
          }
        }
      }
    })

    // Format response to match the Club interface
    const formattedClub = {
      id: updatedClub.id,
      name: updatedClub.name,
      description: updatedClub.description,
      department: updatedClub.department,
      status: updatedClub.status,
      foundedYear: updatedClub.foundedYear,
      memberCount: updatedClub._count.memberships,
      eventCount: updatedClub._count.events,
      leader: updatedClub.leader ? {
        name: updatedClub.leader.name,
        email: updatedClub.leader.email
      } : {
        name: 'No Leader',
        email: ''
      }
    }

    return NextResponse.json(formattedClub, { status: 200 })
  } catch (error) {
    console.error('Error updating club:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
