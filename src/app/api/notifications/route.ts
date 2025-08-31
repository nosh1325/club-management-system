import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    
    // Get all notifications where user is in recipients list
    const allNotifications = await db.notification.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Filter notifications for this user
    const userNotifications = allNotifications.filter(notification => {
      const recipients = JSON.parse(notification.recipients)
      return recipients.includes(userId)
    })

    // Get read status from localStorage simulation (we'll handle this in frontend)
    // For now, just return notifications
    const notificationsWithReadStatus = userNotifications.map(notification => ({
      ...notification,
      recipients: JSON.parse(notification.recipients),
      isRead: false // Will be determined by frontend localStorage
    }))

    return NextResponse.json({
      notifications: notificationsWithReadStatus,
      stats: {
        total: notificationsWithReadStatus.length,
        unread: notificationsWithReadStatus.filter(n => !n.isRead).length
      }
    })

  } catch (error) {
    console.error('Error fetching user notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}