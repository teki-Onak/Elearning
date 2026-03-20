export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  console.log('[EMAIL] Email sending disabled - no RESEND_API_KEY set')
  return
}

export function notificationEmail(title: string, message: string, userName: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1e293b; border-radius: 12px; padding: 32px;">
        <h1 style="color: #6366f1; margin: 0 0 8px;">EduFlow</h1>
        <hr style="border-color: #334155; margin: 16px 0;" />
        <p style="color: #94a3b8; margin: 0 0 16px;">Hi ${userName},</p>
        <h2 style="color: #ffffff; margin: 0 0 12px;">${title}</h2>
        <p style="color: #cbd5e1; margin: 0 0 24px;">${message}</p>
        <hr style="border-color: #334155; margin: 24px 0;" />
        <p style="color: #475569; font-size: 12px; margin: 0;">EduFlow Learning Platform</p>
      </div>
    </div>
  `
}
