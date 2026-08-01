import nodemailer from 'nodemailer'

import config from '@src/configs/app.config'

let transporter = null

const getMailTransportMode = () => config.get('mail.transport')

const createTransporter = () => {
  if (getMailTransportMode() === 'json') {
    return nodemailer.createTransport({
      jsonTransport: true
    })
  }

  const host = config.get('mail.smtp.host')

  if (!host) {
    throw new Error('SMTP_HOST is required when MAIL_TRANSPORT is smtp')
  }

  const username = config.get('mail.smtp.username')
  const password = config.get('mail.smtp.password')

  return nodemailer.createTransport({
    host,
    port: config.get('mail.smtp.port'),
    secure: config.get('mail.smtp.secure'),
    auth: username
      ? {
          user: username,
          pass: password
        }
      : undefined
  })
}

const sendMail = message => {
  if (!transporter) transporter = createTransporter()

  return transporter.sendMail({
    from: {
      name: config.get('mail.fromName'),
      address: config.get('mail.fromAddress')
    },
    ...message
  })
}

export { getMailTransportMode, sendMail }
