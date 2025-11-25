import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  nitro: {
    experimental: {
      tasks:
        process.env.GARBAGE_CLEANER_CRON && process.env.GARBAGE_CLEANER_FUNCTION
          ? true
          : false,
    },
    scheduledTasks: {
      [process.env.GARBAGE_CLEANER_CRON!]: ['garbage-cleaner'],
    },
  },

  vite: {
    plugins: [tailwindcss()],
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
    },
  },

  runtimeConfig: {
    DATABASE_URL: process.env.DATABASE_URL || '',
    BASE_URL: process.env.BASE_URL || '',
    SELF_HOSTED: process.env.SELF_HOSTED,
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_KEY: process.env.SUPABASE_KEY || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET || '',
    GARBAGE_CLEANER_FUNCTION: process.env.GARBAGE_CLEANER_FUNCTION || '',

    public: {
      BASE_URL: process.env.BASE_URL || '',
      SELF_HOSTED: process.env.SELF_HOSTED,
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
    '@nuxtjs/supabase',
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

  supabase: {
    redirectOptions: {
      login: '/auth/sign-in',
      exclude: [
        '/auth/sign-up',
        '/auth/forgot-password',
        '/auth/reset-password',
      ],
      callback: '/auth/confirm',
    },
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
