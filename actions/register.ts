'use server'
import * as z from 'zod'
import bcrypt from 'bcryptjs'

import { db } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/mail'
import { generateVerificationToken } from '@/lib/tokens'

import { RegisterSchema } from '@/schemas'
import { getUserByEmail } from '@/data/user'

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = await RegisterSchema.safeParseAsync(values)
  if (!validatedFields.success) {
    return { error: 'Invalid Fields' }
  }

  const { email, name, password } = validatedFields.data
  const hashedPassword = await bcrypt.hash(password, 10)

  const existingUser = await getUserByEmail(email)
  if (existingUser) return { error: 'Email already in use.' }

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })

  // Todo: Send verification token email
  const { email: userEmail, token } = await generateVerificationToken(email)
  await sendVerificationEmail(userEmail, token)

  return { success: 'Confirmation email Sent.' }
}
