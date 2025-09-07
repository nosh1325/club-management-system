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
    
    // Get all notifications
    const allNotifications = await db.notification.findMany()

    // Filter notifications for this user
    const userNotifications = allNotifications.filter(notification => {
      const recipients = JSON.parse(notification.recipients)
      return recipients.includes(userId)
    })

    // Return just the count for dashboard display
    return NextResponse.json({
      total: userNotifications.length,
      unread: userNotifications.length // Will be managed by frontend localStorage
    })

  } catch (error) {
    console.error('Error fetching notification stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification stats' },
      { status: 500 }
    )
  }
}