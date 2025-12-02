import { createAuthClient } from 'better-auth/vue'
import { apiKeyClient, inferAdditionalFields } from 'better-auth/client/plugins'

export default function useAuthClient() {
  const runtimeConfig = useRuntimeConfig()

  const authClient = createAuthClient({
    baseURL: runtimeConfig.public.BETTER_AUTH_URL,
    plugins: [apiKeyClient(), inferAdditionalFields<typeof auth>()],
  })

  return {
    authClient,
  }
}
