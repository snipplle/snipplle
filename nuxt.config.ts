import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

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
    SELF_HOSTED: process.env.SELF_HOSTED,
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_KEY: process.env.SUPABASE_KEY || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET || '',

    public: {
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
        'light-gray',

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
    enabled: false,
  },
})
