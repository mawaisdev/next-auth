import { Resend } from 'resend'

const resend = new Resend(process.env.RESENT_API_KEY)

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `http://localhost:3000/new-verification?token=${token}`

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    subject: 'Confirm Your email!',
    to: email,
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm email address.</p>`,
  })
}
export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `http://localhost:3000/new-password?token=${token}`

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    subject: 'Reset Password!',
    to: email,
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  })
}

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: '2FA Code',
    html: `<p>Your 2FA Code: ${token}</p>`,
  })
}
