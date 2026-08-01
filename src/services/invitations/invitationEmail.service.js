import config from '@src/configs/app.config'
import { getMailTransportMode, sendMail } from '@src/libs/mailer'

const escapeHtml = value =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const getInvitationUrl = token => {
  const url = new URL('/accept-invitation', config.get('frontendUrl'))

  url.searchParams.set('token', token)

  return url.toString()
}

const sendInvitationEmail = async (invitation, token) => {
  const invitationUrl = getInvitationUrl(token)
  const organizationName = invitation.organization.name
  const inviterName = invitation.invitedBy?.fullName || 'Your company manager'
  const roleName = invitation.role.name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  const expiryHours = config.get('invitation.expiresHours')

  const info = await sendMail({
    to: {
      name: invitation.fullName,
      address: invitation.email
    },
    subject: `You're invited to ${organizationName} on Project Pulse`,
    text: [
      `Hi ${invitation.fullName},`,
      '',
      `${inviterName} invited you to join ${organizationName} on Project Pulse as ${roleName}.`,
      `Create your password using this secure link: ${invitationUrl}`,
      '',
      `This one-time link expires in ${expiryHours} hours.`,
      'If you were not expecting this invitation, you can safely ignore this email.'
    ].join('\n'),
    html: `
      <div style="background:#f8fafc;padding:32px 16px;font-family:Inter,Arial,sans-serif;color:#0f172a">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
          <div style="padding:24px 28px;background:linear-gradient(135deg,#111827,#4338ca);color:#ffffff">
            <div style="font-size:13px;font-weight:800;letter-spacing:.08em;color:#c7d2fe">PROJECT PULSE</div>
            <h1 style="margin:10px 0 0;font-size:26px">You're invited</h1>
          </div>
          <div style="padding:28px">
            <p style="margin:0 0 16px">Hi ${escapeHtml(invitation.fullName)},</p>
            <p style="margin:0 0 20px;line-height:1.65;color:#475569">
              <strong>${escapeHtml(inviterName)}</strong> invited you to join
              <strong>${escapeHtml(organizationName)}</strong> as
              <strong>${escapeHtml(roleName)}</strong>.
            </p>
            <a href="${escapeHtml(invitationUrl)}" style="display:inline-block;padding:12px 20px;border-radius:9px;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:700">
              Accept invitation
            </a>
            <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#64748b">
              This one-time link expires in ${expiryHours} hours. If you were not
              expecting this invitation, you can safely ignore this email.
            </p>
          </div>
        </div>
      </div>
    `
  })

  return {
    invitationUrl,
    messageId: info.messageId || null,
    transport: getMailTransportMode()
  }
}

const deliverInvitation = async (invitation, token, logger) => {
  const sentAt = new Date()

  try {
    const delivery = await sendInvitationEmail(invitation, token)

    await invitation.update({
      deliveryStatus: 'sent',
      deliveryError: null,
      lastSentAt: sentAt
    })

    return {
      delivered: true,
      developmentInviteUrl:
        config.get('env') === 'development' && delivery.transport === 'json'
          ? delivery.invitationUrl
          : null,
      messageId: delivery.messageId,
      transport: delivery.transport
    }
  } catch (error) {
    logger.error(
      {
        error,
        invitationId: invitation.id
      },
      'Invitation email delivery failed'
    )

    await invitation.update({
      deliveryStatus: 'failed',
      deliveryError: error.message.slice(0, 1000),
      lastSentAt: sentAt
    })

    return {
      delivered: false,
      developmentInviteUrl: null,
      messageId: null,
      transport: getMailTransportMode()
    }
  }
}

export {
  deliverInvitation,
  getInvitationUrl,
  sendInvitationEmail
}
