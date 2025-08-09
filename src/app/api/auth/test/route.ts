import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ 
        authenticated: false, 
        message: 'No session found' 
      })
    }

    return NextResponse.json({ 
      authenticated: true,
      user: {
        email: session.user?.email,
        name: session.user?.name,
        role: session.user?.role
      }
    })
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
