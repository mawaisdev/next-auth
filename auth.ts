import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'

import { getUserById } from '@/data/user'

import authConfig from '@/auth.config'

import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { getTwoFactorConfirmationByUserId } from '@/data/two-factor-confirmation'
import { getAccountByUserId } from '@/data/accounts'

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: '/login',
    error: '/error',
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      })
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== 'credentials') return true

      // Prevent Sig in without email verification
      const existingUser = await getUserById(user.id)
      if (!existingUser?.emailVerified) return false

      // TODO: Add 2FA Check
      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        )
        if (!twoFactorConfirmation) return false
        // Delete 2FA for next login
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        })
      }
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      if (session.user && token.role) {
        session.user.role = token.role as UserRole
      }
      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
        session.user.isOAuth = token.isOAuth as boolean
        session.user.name = token.name
        session.user.email = token.email
      }
      return session
    },

    async jwt({ token }) {
      if (!token.sub) return token

      const existingUser = await getUserById(token.sub)
      if (!existingUser) return token

      const existingAccount = await getAccountByUserId(existingUser.id)

      token.isOAuth = !!existingAccount
      token.name = existingUser.name
      token.email = existingUser.email
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled
      token.role = existingUser.role
      return token
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  ...authConfig,
})
