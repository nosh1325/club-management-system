import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

import { z } from 'zod'


const membershipActionSchema = z.object({
  membershipIds: z.array(z.string()).min(1, 'At least one membership ID is required'),
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
  roleAssignments: z.array(z.object({
    membershipId: z.string(),
    role: z.enum(['General Member', 'Executive', 'Senior Executive'])
  })).optional()
})

// GET - Get pending memberships for club leader's clubs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'CLUB_LEADER' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    console.log('User details:', { id: user.id, email: user.email, role: user.role }) // Debug log

    let clubs;


    if (user.email === 'leader@bracu.ac.bd') {
      // Super club leader can access all clubs
      console.log('Super leader accessing all clubs') 
      clubs = await db.club.findMany({
        include: {
          memberships: {
            select: {
              id: true,
              status: true,
              role: true,
              createdAt: true,
              updatedAt: true,
              joinedAt: true,
              userId: true,
              clubId: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  studentId: true,
                  department: true,
                  semester: true
                }
              },
              club: {
                select: {
                  id: true,
                  name: true,
                  department: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      })
    } else {
      
      console.log('Club leader, looking for clubs with leaderId:', user.id) 
      
      
      const allClubs = await db.club.findMany({
        select: {
          id: true,
          name: true,
          leaderId: true,
          leader: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      })
      console.log('All clubs and their leaders:', allClubs) 
      
      clubs = await db.club.findMany({
        where: { 
          leaderId: user.id  // clubs where current user is the leader
        },
        include: {
          memberships: {
            select: {
              id: true,
              status: true,
              role: true,
              createdAt: true,
              updatedAt: true,
              joinedAt: true,
              userId: true,
              clubId: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  studentId: true,
                  department: true,
                  semester: true
                }
              },
              club: {
                select: {
                  id: true,
                  name: true,
                  department: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      })
      console.log('Found clubs for user:', clubs.map(c => c.name)) // Debug log
    }

    if (!clubs || clubs.length === 0) {
      return NextResponse.json({ 
        error: user.email === 'leader@bracu.ac.bd' 
          ? 'No clubs found in the system' 
          : 'No clubs found. You are not a leader of any club.' 
      }, { status: 404 })
    }

    // Flatten all memberships from multiple clubs
    const allMemberships = clubs.flatMap(club => 
      club.memberships.map(membership => ({
        ...membership,
        club: {
          id: club.id,
          name: club.name,
          department: club.department
        }
      }))
    )

    const pendingMemberships = allMemberships.filter(m => m.status === 'PENDING')
    const approvedMemberships = allMemberships.filter(m => m.status === 'ACCEPTED')


    const dbMemberships = await db.membership.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        club: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    console.log(' ALL memberships in database:', dbMemberships) 
    console.log(' Current clubs:', clubs.map(c => ({ id: c.id, name: c.name }))) 
    console.log(' Total memberships across all clubs:', allMemberships.length) 

    return NextResponse.json({
      
      club: clubs.length > 0 ? {
        id: clubs[0].id,
        name: clubs[0].name,
        description: clubs[0].description
      } : null,
      
      clubs: clubs.map(club => ({
        id: club.id,
        name: club.name,
        description: club.description,
        department: club.department
      })),
      pendingMemberships,
      approvedMemberships,
      totalMembers: approvedMemberships.length,
      isSuperLeader: user.email === 'leader@bracu.ac.bd'
    })

  } catch (error) {
    console.error('Error fetching memberships:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Bulk approve/reject memberships
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!['CLUB_LEADER', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied. Club leader role required.' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = membershipActionSchema.parse(body)

    const roleMap = new Map()
    if (validatedData.roleAssignments) {
      validatedData.roleAssignments.forEach(assignment => {
        roleMap.set(assignment.membershipId, assignment.role)
      })
    }

   
    const memberships = await db.membership.findMany({
      where: {
        id: { in: validatedData.membershipIds },
        status: 'PENDING',
        ...(user.role === 'CLUB_LEADER' && {
          club: {
            leaderId: user.id
          }
        })
      },
      include: {
        user: {
          select: { name: true, email: true }
        },
        club: {
          select: { name: true }
        }
      }
    })

    if (memberships.length !== validatedData.membershipIds.length) {
      return NextResponse.json(
        { error: 'Some memberships not found or access denied' },
        { status: 404 }
      )
    }

    // Update membership statuses
    const newStatus = validatedData.action === 'approve' ? 'ACCEPTED' : 'REJECTED'
    const joinedAt = validatedData.action === 'approve' ? new Date() : null

    
    const updatedMemberships = []
    for (const membership of memberships) {
      const assignedRole = roleMap.get(membership.id) || 'General Member'
      
      const updated = await db.membership.update({
        where: { id: membership.id },
        data: {
          status: newStatus,
          joinedAt: joinedAt,
          role: validatedData.action === 'approve' ? assignedRole : membership.role,
          updatedAt: new Date()
        },
        include: {
          user: { select: { name: true, email: true } },
          club: { select: { name: true } }
        }
      })
      updatedMemberships.push(updated)
    }



    return NextResponse.json({
      message: `Successfully ${validatedData.action}d ${updatedMemberships.length} membership(s)`,
      count: updatedMemberships.length,
      memberships: updatedMemberships.map((m: any) => ({
        id: m.id,
        userName: m.user.name,
        userEmail: m.user.email,
        clubName: m.club.name,
        role: m.role,
        newStatus
      }))
    })
  } catch (error) {
    console.error('Error processing membership actions:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
