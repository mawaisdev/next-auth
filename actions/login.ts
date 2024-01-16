'use server'
import { LoginSchema } from '@/schemas'
import * as z from 'zod'

import { AuthError } from 'next-auth'

import { signIn } from '@/auth'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { generateVerificationToken } from '@/lib/tokens'
import { getUserByEmail } from '@/data/user'
import { sendVerificationEmail } from '@/lib/mail'

export interface LoginResponse {
  error?: string | undefined
  success?: string | undefined
}
export const login = async (
  values: z.infer<typeof LoginSchema>
): Promise<LoginResponse | undefined> => {
  const validatedFields = await LoginSchema.safeParseAsync(values)
  if (!validatedFields.success) {
    return { error: 'Invalid Fields' }
  }

  const { email, password } = validatedFields.data
  const existingUser = await getUserByEmail(email)
  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: 'Invalid Credentials!' }
  }
  if (!existingUser.emailVerified) {
    const { email, token } = await generateVerificationToken(existingUser.email)

    await sendVerificationEmail(email, token)

    return { error: 'Verify your email. Confirmation mail sent!' }
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
