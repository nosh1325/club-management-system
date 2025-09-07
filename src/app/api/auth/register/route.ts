import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, studentId, department, semester, phone } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    if (!studentId || !studentId.trim()) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }
      if (!department || !department.trim()) {
        return NextResponse.json(
          { error: 'Department is required' },
          { status: 400 }
        )
      }
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Check if student ID is already taken
    if (studentId) {
      const existingStudentId = await db.user.findUnique({
        where: { studentId }
      })

      if (existingStudentId) {
        return NextResponse.json(
          { error: 'User with this student ID already exists' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        studentId,
        department,
        semester,
        phone,
        role: 'STUDENT'
      }
    })

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: userPassword, ...userWithoutPassword } = user

    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'UnknownErrorType';
    
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage, name: errorName },
      { status: 500 }
    )
  }
}
