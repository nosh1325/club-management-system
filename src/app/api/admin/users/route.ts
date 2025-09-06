import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - Fetch all users with their memberships
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    // Fetch all users with their memberships and club details
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentId: true,
        department: true,
        semester: true,
        phone: true,
        createdAt: true,
        emailVerified: true,
        memberships: {
          include: {
            club: {
              select: {
                id: true,
                name: true,
                department: true,
                status: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format the response
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      department: user.department,
      semester: user.semester,
      phone: user.phone,
      createdAt: user.createdAt.toISOString(),
      emailVerified: user.emailVerified?.toISOString() || null,
      memberships: user.memberships.map(membership => ({
        id: membership.id,
        status: membership.status,
        role: membership.role,
        joinedAt: membership.joinedAt?.toISOString() || null,
        club: {
          id: membership.club.id,
          name: membership.club.name,
          department: membership.club.department || 'Unknown',
          status: membership.club.status
        }
      }))
    }))

    return NextResponse.json(
      {
        users: formattedUsers,
        total: formattedUsers.length,
        stats: {
          totalUsers: formattedUsers.length,
          students: formattedUsers.filter(u => u.role === 'STUDENT').length,
          clubLeaders: formattedUsers.filter(u => u.role === 'CLUB_LEADER').length,
          admins: formattedUsers.filter(u => u.role === 'ADMIN').length,
          verifiedEmails: formattedUsers.filter(u => u.emailVerified).length
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
