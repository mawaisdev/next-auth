'use server'
import { RegisterSchema } from '@/schemas'
import * as z from 'zod'

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = await RegisterSchema.safeParseAsync(values)
  if (!validatedFields.success) {
    return { error: 'Invalid Fields' }
  }
  return { success: 'email sent.' }
}
