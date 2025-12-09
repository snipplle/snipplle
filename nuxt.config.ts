import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  nitro: {
    experimental: {
      tasks: process.env.GARBAGE_CLEANER_CRON ? true : false,
    },
    scheduledTasks: {
      [process.env.GARBAGE_CLEANER_CRON!]: ['garbage-cleaner'],
    },
    rollupConfig: {
      plugins: [vue()],
    },
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['@catppuccin/codemirror'],
    },
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },
      titleTemplate: '%s - %siteName',
      templateParams: {
        siteName: 'Snipplle',
      },
      script: [
        process.env.ANALYTICS_URL && process.env.ANALYTICS_SITE_ID
          ? {
              src: process.env.ANALYTICS_URL || '',
              defer: true,
              'data-site-id': process.env.ANALYTICS_SITE_ID || '',
              'data-track-errors': 'true',
              'data-session-replay': 'true',
            }
          : {},
      ],
    },
  },

  runtimeConfig: {
    DATABASE_URL: process.env.DATABASE_URL || '',
    BASE_URL: process.env.BASE_URL || '',
    SSL_PREFIX: process.env.SSL_PREFIX || '',
    SELF_HOSTED: process.env.SELF_HOSTED,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || '',
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || '',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
    MAIL_HOST: process.env.MAIL_HOST || '',
    MAIL_PORT: process.env.MAIL_PORT || '',
    MAIL_USER: process.env.MAIL_USER || '',
    MAIL_PASSWORD: process.env.MAIL_PASSWORD || '',
    EXTERNAL_FUNCTIONS_URL: process.env.EXTERNAL_FUNCTIONS_URL || '',
    AWS_REGION: process.env.AWS_REGION || '',
    AWS_ENDPOINT: process.env.AWS_ENDPOINT || '',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
    BUCKET_NAME: process.env.BUCKET_NAME || '',
    GARBAGE_CLEANER_FUNCTION: process.env.GARBAGE_CLEANER_FUNCTION || '',

    public: {
      BASE_URL: process.env.BASE_URL || '',
      SSL_PREFIX: process.env.SSL_PREFIX || '',
      SELF_HOSTED: process.env.SELF_HOSTED,
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || '',
    },
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@vueuse/nuxt',
    'nuxt-security',
    '@nuxtjs/seo',
    'nuxt-codemirror',
  ],

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'dark',
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  ui: {
    theme: {
      colors: [
        // main colors
        'primary',
        'secondary',
        'info',
        'success',
        'warning',
        'error',

        // tag colors
        'red',
        'orange',
        'amber',
        'lime',
        'emerald',
        'teal',
        'cyan',
        'sky',
        'indigo',
        'violet',
        'fuchsia',
        'rose',
        'neutral',
        'green',
        'blue',
        'yellow',
        'purple',
        'pink',
      ],
    },
  },

  imports: {
    dirs: ['composables', 'composables/*/*.ts', 'types/**/*.ts'],
  },

  security: {
    corsHandler: {
      origin: '*',
    },
    headers: {
      contentSecurityPolicy: {
        'img-src': [
          "'self'",
          'https:',
          'data:',
          'blob:',
          'https://*.stripe.com',
        ],
        'font-src': ["'self'", 'https:', 'data:', 'https://js.stripe.com'],
        'script-src': [
          "'self'",
          'https://connect-js.stripe.com',
          'https://js.stripe.com',
          "'unsafe-inline'",
        ],
        'style-src': [
          "'self'",
          'https:',
          'sha256-0hAheEzaMe6uXIKV4EehS9pu1am1lj/KnnzrOYqckXk=',
          "'unsafe-inline'",
        ],
      },
      permissionsPolicy: {
        fullscreen: ['*'],
      },
      crossOriginResourcePolicy: 'cross-origin',
      crossOriginEmbedderPolicy: 'unsafe-none',
      crossOriginOpenerPolicy: 'unsafe-none',
    },
    rateLimiter: false,
  },
})
