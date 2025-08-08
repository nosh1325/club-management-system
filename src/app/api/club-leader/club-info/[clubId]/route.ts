import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// PUT - Update club information
export async function PUT(
  request: NextRequest,
  { params }: { params: { clubId: string } }
) {
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
        { error: 'Access denied. Only club leaders can edit club information.' },
        { status: 403 }
      )
    }

    const clubId = params.clubId

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

    // Verify that this user is the leader of the club they're trying to edit
    const existingClub = await db.club.findFirst({
      where: { 
        id: clubId,
        leaderId: user.id 
      }
    })

    if (!existingClub) {
      return NextResponse.json(
        { error: 'Club not found or you are not authorized to edit this club.' },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      name,
      description,
      category,
      department,
      email,
      phone,
      website,
      advisor,
      vision,
      mission,
      activities
    } = body

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Club name is required' },
        { status: 400 }
      )
    }

    if (!description?.trim()) {
      return NextResponse.json(
        { error: 'Club description is required' },
        { status: 400 }
      )
    }

    // Check if name is unique (excluding current club)
    const nameExists = await db.club.findFirst({
      where: {
        name: name.trim(),
        id: { not: clubId }
      }
    })

    if (nameExists) {
      return NextResponse.json(
        { error: 'A club with this name already exists' },
        { status: 400 }
      )
    }

    // Update the club
    const updatedClub = await db.club.update({
      where: { id: clubId },
      data: {
        name: name.trim(),
        description: description.trim(),
        category: category?.trim() || null,
        department: department?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        website: website?.trim() || null,
        advisor: advisor?.trim() || null,
        vision: vision?.trim() || null,
        mission: mission?.trim() || null,
        activities: activities?.trim() || null,
        updatedAt: new Date()
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
        updatedAt: true
      }
    })

    console.log(`✅ Club updated successfully: ${updatedClub.name} by ${session.user.email}`)

    return NextResponse.json({
      success: true,
      message: 'Club information updated successfully',
      club: updatedClub
    })

  } catch (error) {
    console.error('Error updating club:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
