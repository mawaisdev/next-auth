import { Resend } from 'resend'

const resend = new Resend(process.env.RESENT_API_KEY)

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `http://localhost:3000/new-verification?token=${token}`

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    subject: 'Confirm Your email!',
    to: email,
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm email address.
    <br />
      Link: ${confirmLink}
    </p>`,
  })
}
