/**
 * @fileoverview Enhanced Auth.js v5 configuration with multi-tenant SPPG support
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { db } from '@/lib/prisma'
import { UserRole, UserType } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      userRole?: UserRole | null
      sppgId?: string | null
      userType?: UserType
    }
  }

  interface User {
    id: string
    email: string
    name: string
    userRole?: UserRole | null
    sppgId?: string | null
    userType?: UserType
  }
}

const config = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: '/login',
    error: '/login?error=true',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email dan password wajib diisi')
          }

          // Find user with basic data
          const user = await db.user.findUnique({
            where: { email: credentials.email as string }
          })

          if (!user) {
            throw new Error('Email atau password salah')
          }

          // Verify password
          if (!user.password) {
            throw new Error('Akun tidak memiliki password')
          }

          const isPasswordValid = await compare(credentials.password as string, user.password)
          if (!isPasswordValid) {
            throw new Error('Email atau password salah')
          }

          // Check if user is active
          if (!user.isActive) {
            throw new Error('Akun Anda telah dinonaktifkan. Hubungi administrator.')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            userRole: user.userRole,
            sppgId: user.sppgId,
            userType: user.userType,
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.userRole = user.userRole
        token.sppgId = user.sppgId
        token.userType = user.userType
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.userRole = token.userRole as UserRole | null
        session.user.sppgId = token.sppgId as string | null
        session.user.userType = token.userType as UserType
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Handle redirect after sign in based on user role
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  debug: process.env.NODE_ENV === 'development',
})

export const { handlers, auth, signIn, signOut } = config