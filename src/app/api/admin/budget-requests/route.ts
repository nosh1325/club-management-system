import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - Fetch all budget requests (Admin only)
export async function GET(request: NextRequest) {
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

    const whereClause: any = {}
    if (status && status !== 'ALL') {
      whereClause.status = status
    }

    const budgetRequests = await db.budgetRequest.findMany({
      where: whereClause,
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
            name: true,
            department: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedRequests = budgetRequests.map(request => ({
      id: request.id,
      title: request.title,
      description: request.description,
      amount: request.amount,
      purpose: request.purpose,
      status: request.status,
      requestedAt: request.requestedAt?.toISOString() || null,
      reviewedBy: request.reviewedBy,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
      user: request.user,
      club: request.club
    }))

    return NextResponse.json({
      requests: formattedRequests,
      total: formattedRequests.length,
      stats: {
        pending: formattedRequests.filter(r => r.status === 'PENDING').length,
        approved: formattedRequests.filter(r => r.status === 'APPROVED').length,
        rejected: formattedRequests.filter(r => r.status === 'REJECTED').length,
        totalAmount: formattedRequests.reduce((sum, r) => sum + (r.amount || 0), 0),
        pendingAmount: formattedRequests
          .filter(r => r.status === 'PENDING')
          .reduce((sum, r) => sum + (r.amount || 0), 0)
      }
    })
  } catch (error) {
    console.error('Error fetching budget requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update budget request status (Admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { requestId, action } = body

    if (!requestId || !action) {
      return NextResponse.json(
        { error: 'Request ID and action are required.' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve or reject.' },
        { status: 400 }
      )
    }

    // Check if request exists
    const existingRequest = await db.budgetRequest.findUnique({
      where: { id: requestId }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Budget request not found.' },
        { status: 404 }
      )
    }

    // Update the request
    const updateData: any = {
      reviewedBy: session.user.id,
      updatedAt: new Date()
    }

    if (action === 'approve') {
      updateData.status = 'APPROVED'
    } else {
      updateData.status = 'REJECTED'
    }

    const updatedRequest = await db.budgetRequest.update({
      where: { id: requestId },
      data: updateData,
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
            name: true,
            department: true
          }
        }
      }
    })

    return NextResponse.json({
      message: `Budget request ${action}d successfully`,
      request: {
        id: updatedRequest.id,
        title: updatedRequest.title,
        status: updatedRequest.status,
        amount: updatedRequest.amount,
        reviewedBy: updatedRequest.reviewedBy,
        updatedAt: updatedRequest.updatedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Error updating budget request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
