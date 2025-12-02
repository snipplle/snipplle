export default defineNuxtRouteMiddleware(async (_, __) => {
  if (import.meta.server) {
    return
  }

  const { authClient } = useAuthClient()

  const { data } = await authClient.getSession()

  if (data?.session) {
    return navigateTo('/auth/confirm')
  }
})
