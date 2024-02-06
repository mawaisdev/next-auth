import { UserRole } from '@prisma/client'
import NextAuth, { type DefaultSession } from 'next-auth'
import { Jwt } from '@auth/core/jwt'

export type ExtendedUser = DefaultSession['user'] & {
  role: UserRole
  isTwoFactorEnabled: boolean
}

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser
  }
}
