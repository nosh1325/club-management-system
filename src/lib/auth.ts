import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          studentId: user.studentId,
          department: user.department,
          semester: user.semester,
          phone: user.phone,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.studentId = user.studentId
        token.department = user.department
        token.semester = user.semester
        token.phone = user.phone
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.studentId = token.studentId
        session.user.department = token.department
        session.user.semester = token.semester
        session.user.phone = token.phone
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}

declare module 'next-auth' {
  interface User {
    role: string
    studentId?: string | null
    department?: string | null
    semester?: string | null
    phone?: string | null
  }
  interface Session {
    user: User & {
      id: string
      role: string
      studentId?: string | null
      department?: string | null
      semester?: string | null
      phone?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    studentId?: string | null
    department?: string | null
    semester?: string | null
    phone?: string | null
  }
}
