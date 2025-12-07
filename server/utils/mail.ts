import nodemailer from 'nodemailer'

const runtimeConfig = useRuntimeConfig()

export const transporter = nodemailer.createTransport({
  host: runtimeConfig.MAIL_HOST,
  port: runtimeConfig.MAIL_PORT,
  secure: true,
  auth: {
    user: runtimeConfig.MAIL_USER,
    pass: runtimeConfig.MAIL_PASSWORD,
  },
})
