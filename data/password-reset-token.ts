import { db } from '@/lib/db'

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const passwordResetToken = await db.passwordReset.findUnique({
      where: { token },
    })

    return passwordResetToken
  } catch (error) {
    return null
  }
}
export const getPasswordResetTokenByEmail = async (email: string) => {
  try {
    const passwordResetToken = await db.passwordReset.findFirst({
      where: { email },
    })

    return passwordResetToken
  } catch (error) {
    return null
  }
}
