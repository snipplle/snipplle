import nodemailer from 'nodemailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'

const runtimeConfig = useRuntimeConfig()

export const transporter = nodemailer.createTransport({
  host: runtimeConfig.MAIL_HOST,
  port: Number(runtimeConfig.MAIL_PORT),
  secure: true,
  auth: {
    user: runtimeConfig.MAIL_USER,
    pass: runtimeConfig.MAIL_PASSWORD,
  },
} satisfies SMTPTransport.Options)
