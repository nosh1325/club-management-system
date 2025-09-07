import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// DELETE - Delete a user and all their data (Updated for Next.js 15)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const params = await context.params
    const { userId } = params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required.' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            memberships: true,
            eventRsvps: true,
            budgetRequests: true,
            leadingClubs: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      )
    }

    // Prevent deletion of admin users (optional safety measure)
    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot delete admin users.' },
        { status: 403 }
      )
    }

    // If user is leading any clubs, we need to handle that first
    if (user._count.leadingClubs > 0) {
      // Remove leadership from clubs (set leaderId to null)
      await db.club.updateMany({
        where: { leaderId: userId },
        data: { leaderId: null }
      })
    }

    // Delete user and all related data (using cascade delete)
    // This will automatically delete memberships, eventRsvps, accounts, sessions, etc.
    await db.user.delete({
      where: { id: userId }
    })

    return NextResponse.json(
      { 
        message: 'User deleted successfully',
        deletedUser: {
          id: user.id,
          name: user.name,
          email: user.email,
          membershipCount: user._count.memberships,
          eventRsvpCount: user._count.eventRsvps,
          clubsLed: user._count.leadingClubs
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
