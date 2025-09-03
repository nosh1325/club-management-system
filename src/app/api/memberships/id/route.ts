import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// PATCH - Update membership role
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    if (user.role !== 'CLUB_LEADER' && user.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Access denied. Only club leaders can update member roles.' 
      }, { status: 403 })
    }

    const { id: membershipId } = await context.params
    const { role } = await request.json()

    // Validate role
    const validRoles = ['General Member', 'Executive', 'Senior Executive']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        error: 'Invalid role. Must be one of: ' + validRoles.join(', ') 
      }, { status: 400 })
    }

    // Find the membership and verify the user can update it
    const membership = await db.membership.findFirst({
      where: {
        id: membershipId,
        status: 'ACCEPTED', // Only update approved members
        OR: [
          // User is admin
          ...(user.role === 'ADMIN' ? [{}] : []),
          // User is the club leader
          ...(user.role === 'CLUB_LEADER' ? [{
            club: { leaderId: user.id }
          }] : []),
          // User has leadership role in club through membership
          ...(user.role === 'CLUB_LEADER' ? [{
            club: {
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
          }] : [])
        ]
      },
      include: {
        user: { select: { name: true, email: true } },
        club: { select: { name: true } }
      }
    })

    if (!membership) {
      return NextResponse.json({ 
        error: 'Membership not found or you are not authorized to update this member.' 
      }, { status: 404 })
    }

    // Update the membership role
    const updatedMembership = await db.membership.update({
      where: { id: membershipId },
      data: { 
        role,
        updatedAt: new Date()
      },
      include: {
        user: { select: { name: true, email: true } },
        club: { select: { name: true } }
      }
    })

    return NextResponse.json({
      message: 'Member role updated successfully',
      membership: {
        id: updatedMembership.id,
        userName: updatedMembership.user.name,
        userEmail: updatedMembership.user.email,
        clubName: updatedMembership.club.name,
        newRole: role
      }
    })

  } catch (error) {
    console.error('Error updating membership role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
