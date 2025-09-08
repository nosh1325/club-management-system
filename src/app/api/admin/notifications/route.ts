import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const { title, message, type, target, clubId } = await request.json()

    if (!title || !message || !type || !target) {
      return NextResponse.json(
        { error: 'Title, message, type, and target are required' },
        { status: 400 }
      )
    }

    // Determine recipients based on target
    let recipients: string[] = []

    switch (target) {
      case 'ALL_USERS':
        const allUsers = await db.user.findMany({
          select: { id: true }
        })
        recipients = allUsers.map(user => user.id)
        break

      case 'ALL_CLUB_LEADERS':
        const clubLeaders = await db.user.findMany({
          where: { role: 'CLUB_LEADER' },
          select: { id: true }
        })
        recipients = clubLeaders.map(user => user.id)
        break

      case 'STUDENTS_ONLY':
        const students = await db.user.findMany({
          where: { role: 'STUDENT' },
          select: { id: true }
        })
        recipients = students.map(user => user.id)
        break

      case 'ADMINS_ONLY':
        const admins = await db.user.findMany({
          where: { role: 'ADMIN' },
          select: { id: true }
        })
        recipients = admins.map(user => user.id)
        break

      case 'SPECIFIC_CLUB':
        if (!clubId) {
          return NextResponse.json(
            { error: 'Club ID is required for club-specific notifications' },
            { status: 400 }
          )
        }
        
        const clubMembers = await db.membership.findMany({
          where: { 
            clubId: clubId,
            status: 'ACCEPTED'
          },
          select: { userId: true }
        })
        recipients = clubMembers.map(membership => membership.userId)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid target specified' },
          { status: 400 }
        )
    }

    // Create notification
    const notification = await db.notification.create({
      data: {
        title,
        message,
        type,
        recipients: JSON.stringify(recipients),
        sentAt: new Date(),
        createdAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      notification: {
        ...notification,
        recipients: recipients,
        recipientCount: recipients.length
      }
    })

  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.notification.count()
    ])

    const notificationsWithCount = notifications.map(notification => {
      let recipients;
      try {
        // Try to parse as JSON array
        recipients = JSON.parse(notification.recipients);
      } catch (error) {
        // If it fails, treat as single email string
        recipients = [notification.recipients];
      }
      
      return {
        ...notification,
        recipients: recipients,
        recipientCount: recipients.length
      };
    })

    return NextResponse.json({
      notifications: notificationsWithCount,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}