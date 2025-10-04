export default defineNuxtRouteMiddleware(async (_, __) => {
  if (import.meta.server) {
    return
  }

  const session = await useSupabaseSession()

  if (session.value) {
    return navigateTo('/auth/confirm')
  }
})
