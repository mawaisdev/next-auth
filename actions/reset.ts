'use server'
import * as z from 'zod'

import { ResetSchema } from '@/schemas'
import { getUserByEmail } from '@/data/user'
import { sendPasswordResetEmail } from '@/lib/mail'
import { generatePasswordResetToken } from '@/lib/tokens'

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values)
  if (!validatedFields.success) return { error: 'Invalid Email!' }

  const { email: userEmail } = validatedFields.data
  const existingUser = await getUserByEmail(userEmail)

  if (!existingUser) return { error: 'Email not found!' }

  //TODO: Generate token and send
  const { email, token } = await generatePasswordResetToken(userEmail)
  await sendPasswordResetEmail(email, token)
  return { success: 'Reset Email sent!' }
}
