'use server'
import { LoginSchema } from '@/schemas'
import * as z from 'zod'

import { AuthError } from 'next-auth'

import { signIn } from '@/auth'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { generateVerificationToken } from '@/lib/tokens'
import { generateTwoFactorToken } from '@/lib/tokens'

import { getUserByEmail } from '@/data/user'
import { getTwoFactorTokenByEmail } from '@/data/two-factor-token'
import { getTwoFactorConfirmationByUserId } from '@/data/two-factor-confirmation'

import { sendVerificationEmail, sendTwoFactorTokenEmail } from '@/lib/mail'
import { db } from '@/lib/db'

export interface LoginResponse {
  error?: string | undefined
  success?: string | undefined
  twoFactor?: boolean | undefined
}
export const login = async (
  values: z.infer<typeof LoginSchema>
): Promise<LoginResponse | undefined> => {
  const validatedFields = await LoginSchema.safeParseAsync(values)
  if (!validatedFields.success) {
    return { error: 'Invalid Fields' }
  }

  const { email, password, code } = validatedFields.data
  const existingUser = await getUserByEmail(email)
  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: 'Invalid Credentials!' }
  }
  if (!existingUser.emailVerified) {
    const { email, token } = await generateVerificationToken(existingUser.email)

    await sendVerificationEmail(email, token)
    return { error: 'Verify your email. Confirmation mail sent!' }
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      // TODO: Verify Code
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email)
      if (!twoFactorToken) return { error: 'Invalid Code!' }
      if (twoFactorToken.token !== code) return { error: 'Invalid Code!' }
      const hasExpired = new Date(twoFactorToken.expires) < new Date()
      if (hasExpired) return { error: 'Code Expired!' }

      await db.twoFactorToken.delete({
        where: {
          id: twoFactorToken.id,
        },
      })

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id
      )
      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        })
      }

      await db.twoFactorConfirmation.create({
        data: { userId: existingUser.id },
      })
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email)
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token)

      return { twoFactor: true }
    }
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid Credentials!' }
        default:
          return { error: 'Something went wrong!' }
      }
    }
    throw error
  }
}
