import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clubId = searchParams.get('clubId')
    const search = searchParams.get('search')

    // Build filter conditions
    const whereConditions: any = {}
    
    if (status && status !== 'all') {
      whereConditions.status = status.toUpperCase()
    }
    
    if (clubId) {
      whereConditions.clubId = clubId
    }

    if (search) {
      whereConditions.OR = [
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            email: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            studentId: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ]
    }

    // Get memberships with related data
    const memberships = await db.membership.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            department: true,
            phone: true,
            role: true
          }
        },
        club: {
          select: {
            id: true,
            name: true,
            description: true,
            leaderId: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Get summary statistics
    const stats = await db.membership.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    // Format stats for easier use
    const formattedStats = {
      total: memberships.length,
      active: stats.find((s: any) => s.status === 'ACCEPTED')?._count.id || 0,
      pending: stats.find((s: any) => s.status === 'PENDING')?._count.id || 0,
      rejected: stats.find((s: any) => s.status === 'REJECTED')?._count.id || 0
    }

    // Get clubs for filter dropdown
    const clubs = await db.club.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      memberships,
      stats: formattedStats,
      clubs
    })

  } catch (error) {
    console.error('Error fetching admin memberships:', error)
    return NextResponse.json(
      { error: 'Failed to fetch memberships' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    console.log('PATCH /api/admin/memberships called')
    
    const session = await getServerSession(authOptions)
    console.log('Session:', session ? { role: session.user.role, email: session.user.email } : 'No session')
    
    if (!session || session.user.role !== 'ADMIN') {
      console.log('Unauthorized access attempt')
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Request body:', body)
    const { membershipId, action } = body

    if (!membershipId || !action) {
      return NextResponse.json(
        { error: 'Membership ID and action are required' },
        { status: 400 }
      )
    }

    // Validate action
    if (!['approve', 'reject', 'remove', 'setLeader'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve, reject, remove, or setLeader' },
        { status: 400 }
      )
    }

    // Get the membership
    console.log('Looking for membership with ID:', membershipId)
    const membership = await db.membership.findUnique({
      where: { id: membershipId },
      include: {
        user: true,
        club: true
      }
    })
    console.log('Found membership:', membership ? { id: membership.id, status: membership.status } : 'Not found')

    if (!membership) {
      console.log('Membership not found')
      return NextResponse.json(
        { error: 'Membership not found' },
        { status: 404 }
      )
    }

    let updatedMembership

    if (action === 'setLeader') {
      const { userId, clubId } = body
      
      if (!userId || !clubId) {
        return NextResponse.json(
          { error: 'User ID and Club ID are required for setLeader action' },
          { status: 400 }
        )
      }

      // Verify the membership is accepted
      if (membership.status !== 'ACCEPTED') {
        return NextResponse.json(
          { error: 'Only accepted members can be set as leaders' },
          { status: 400 }
        )
      }

      // Check if the club already has a leader
      const currentClub = await db.club.findUnique({
        where: { id: clubId },
        include: { leader: true }
      })

      if (currentClub?.leaderId && currentClub.leaderId !== userId) {
        // Remove the previous leader's role
        await db.user.update({
          where: { id: currentClub.leaderId },
          data: { role: 'STUDENT' }
        })

        // Update the previous leader's membership role
        await db.membership.updateMany({
          where: {
            userId: currentClub.leaderId,
            clubId: clubId,
            role: 'Leader'
          },
          data: { role: 'Member' }
        })

        console.log('Previous leader removed:', currentClub.leaderId)
      }

      // Update the user's role to CLUB_LEADER
      await db.user.update({
        where: { id: userId },
        data: { role: 'CLUB_LEADER' }
      })

      // Update the club's leader
      await db.club.update({
        where: { id: clubId },
        data: { leaderId: userId }
      })

      // Update the membership role to Leader
      updatedMembership = await db.membership.update({
        where: { id: membershipId },
        data: { role: 'Leader' },
        include: {
          user: true,
          club: true
        }
      })

      // Create notification for the new leader
      await db.notification.create({
        data: {
          title: 'You are now a Club Leader!',
          message: `Congratulations! You have been appointed as the leader of ${membership.club.name}. You now have access to club management features.`,
          type: 'SYSTEM',
          recipients: userId
        }
      })

      console.log('User set as leader successfully:', { userId, clubId })
    } else {
      // Handle existing actions (approve, reject, remove)
      let updateData: any = {}

      switch (action) {
        case 'approve':
          updateData = { 
            status: 'ACCEPTED',
            joinedAt: new Date()
          }
          break
        case 'reject':
          updateData = { status: 'REJECTED' }
          break
        case 'remove':
          // Delete the membership
          await db.membership.delete({
            where: { id: membershipId }
          })
          console.log('Membership removed successfully')
          return NextResponse.json({ message: 'Membership removed successfully' })
        default:
          return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
          )
      }

      updatedMembership = await db.membership.update({
        where: { id: membershipId },
        data: updateData,
        include: {
          user: true,
          club: true
        }
      })
    }

    console.log('Membership updated successfully:', updatedMembership)

    return NextResponse.json({
      message: `Membership ${action}ed successfully`,
      membership: updatedMembership
    })

  } catch (error) {
    console.error('Error updating membership:', error)
    return NextResponse.json(
      { error: 'Failed to update membership' },
      { status: 500 }
    )
  }
}
