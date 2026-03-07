// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@vueuse/motion/nuxt',
    '@nuxtjs/i18n',
  ],

  i18n: {
    locales: [
      { code: 'fr', iso: 'fr-FR', name: 'Français', file: 'fr.json' },
      { code: 'en', iso: 'en-US', name: 'English',  file: 'en.json' },
      { code: 'es', iso: 'es-ES', name: 'Español',  file: 'es.json' },
    ],
    defaultLocale: 'fr',
    langDir: 'i18n/',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'clo_clo_locale',
      redirectOn: 'root',
    },
  },

  runtimeConfig: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      stripeKey: process.env.NUXT_PUBLIC_STRIPE_KEY || '',
      cloudinaryCloudName: process.env.NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
    },
  },

  imports: {
    dirs: ['stores', 'composables'],
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'CLO-CLO — Puzzles, Livres & T-shirts pour enfants',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'CLO-CLO : puzzles, pins, autocollants, livres d\'activités, livres à colorier, cahiers de vacances et t-shirts pour enfants.',
        },
        { name: 'theme-color', content: '#ff6933' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap',
        },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  ssr: true,

  typescript: {
    strict: true,
    shim: false,
  },
})
