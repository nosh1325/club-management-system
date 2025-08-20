import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'


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

   
    if (session.user.role !== 'CLUB_LEADER') {
      return NextResponse.json(
        { error: 'Access denied. Only club leaders can edit club information.' },
        { status: 403 }
      )
    }

    const clubId = params.clubId

  
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

    
    const existingClub = await db.club.findFirst({
      where: { 
        id: clubId,
        OR: [
          { leaderId: user.id },
          {
            memberships: {
              some: {
                userId: user.id,
                role: {
                  in: ["Club Leader", "President", "Leader"]
                },
                status: "ACCEPTED"
              }
            }
          }
        ]
      }
    })

    if (!existingClub) {
      return NextResponse.json(
        { error: 'Club not found or you are not authorized to edit this club.' },
        { status: 404 }
      )
    }

    
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
