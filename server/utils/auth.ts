import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { apiKey } from 'better-auth/plugins'
import { render } from '@vue-email/render'
import { transporter } from './mail'

import EmailVerification from '~/components/mail/EmailVerification.vue'
import ResetPassword from '~/components/mail/ResetPassword.vue'
import PasswordChanged from '~/components/mail/PasswordChanged.vue'

const runtimeConfig = useRuntimeConfig()

const db = useDrizzle()

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  trustedOrigins: [`${runtimeConfig.SSL_PREFIX}://${runtimeConfig.BASE_URL}`],
  plugins: [
    apiKey({
      rateLimit: {
        enabled: false,
      },
    }),
  ],
  rateLimit: {
    enabled: false,
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }, _) => {
      const html = await render(
        ResetPassword,
        {
          name: user.name,
          url,
        },
        {
          pretty: true,
        },
      )

      await transporter.sendMail({
        from: 'Snipplle <no-reply@snipplle.com>',
        to: user.email,
        subject: 'Reset Password',
        html,
      })
    },
    onPasswordReset: async ({ user }, _) => {
      const html = await render(
        PasswordChanged,
        {
          name: user.name,
        },
        {
          pretty: true,
        },
      )

      await transporter.sendMail({
        from: 'Snipplle <no-reply@snipplle.com>',
        to: user.email,
        subject: 'Password Changed',
        html,
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }, _) => {
      const html = await render(
        EmailVerification,
        {
          name: user.name,
          url,
        },
        {
          pretty: true,
        },
      )

      await transporter.sendMail({
        from: 'Snipplle <no-reply@snipplle.com>',
        to: user.email,
        subject: 'Email Verification',
        html,
      })
    },
  },
  socialProviders: {
    github: {
      clientId: runtimeConfig.GITHUB_CLIENT_ID,
      clientSecret: runtimeConfig.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: runtimeConfig.GOOGLE_CLIENT_ID,
      clientSecret: runtimeConfig.GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      onboardingCompleted: {
        type: 'boolean',
        default: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (runtimeConfig.SELF_HOSTED === 'true') {
            return
          }

          await fetch(
            `${runtimeConfig.EXTERNAL_FUNCTIONS_URL}/create/customer`,
            {
              method: 'POST',
              body: JSON.stringify({
                userId: user.id,
                name: user.name,
                email: user.email,
              }),
            },
          )
        },
      },
    },
  },
})
