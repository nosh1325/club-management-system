import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import serverEmailService from '@/lib/serverEmailService'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'CLUB_LEADER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized. Only club leaders and admins can send bulk emails.' },
        { status: 401 }
      )
    }

    const { clubId, subject, message, memberIds } = await request.json()

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, message' },
        { status: 400 }
      )
    }

    let whereClause: any = {
      status: 'ACCEPTED'
    }

    if (clubId) {
      whereClause.clubId = clubId
      
      if (session.user.role !== 'ADMIN') {
        const club = await db.club.findUnique({
          where: { id: clubId }
        })
        
        if (!club || club.leaderId !== session.user.id) {
          return NextResponse.json(
            { error: 'You are not authorized to send emails to this club' },
            { status: 403 }
          )
        }
      }
    } else {
      
      if (session.user.role !== 'ADMIN') {
        const userClubs = await db.club.findMany({
          where: { leaderId: session.user.id },
          select: { id: true }
        })
        
        if (userClubs.length === 0) {
          return NextResponse.json(
            { error: 'You are not leading any clubs' },
            { status: 403 }
          )
        }
        
        whereClause.clubId = {
          in: userClubs.map(club => club.id)
        }
      }
    }

    // Filter by member IDs if provided
    if (memberIds && memberIds.length > 0) {
      whereClause.userId = {
        in: memberIds
      }
    }

    // Get all accepted members
    const memberships = await db.membership.findMany({
      where: whereClause,
      include: {
        user: true,
        club: true
      }
    })

    if (memberships.length === 0) {
      return NextResponse.json(
        { error: 'No members found to send emails to' },
        { status: 404 }
      )
    }

    // Prepare recipient list
    const recipients = memberships.map(membership => ({
      email: membership.user.email,
      name: membership.user.name || 'Member'
    }))

    // Send bulk emails
    const bulkResult = await serverEmailService.sendBulkEmails(
      recipients,
      subject,
      message,
      session.user.name || 'Club Leader'
    )

    // Log the bulk email activity
    const clubNames = [...new Set(memberships.map(m => m.club.name))].join(', ')
    await db.notification.create({
      data: {
        title: `Bulk email sent to ${bulkResult.summary.total} members`,
        message: `Subject: ${subject} | Clubs: ${clubNames}`,
        type: 'BULK_EMAIL',
        recipients: recipients.map(r => r.email).join(', ')
      }
    })

    return NextResponse.json({
      success: true,
      message: `Bulk email completed. ${bulkResult.summary.sent} sent, ${bulkResult.summary.failed} failed.`,
      summary: bulkResult.summary,
      results: bulkResult.results,
      simulation: bulkResult.results.some(r => r.error?.includes('simulation'))
    })

  } catch (error) {
    console.error('Error sending bulk email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
