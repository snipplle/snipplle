import type { UseLogout } from '@/types/global.types'

export function useLogout(): UseLogout {
  const { authClient } = useAuthClient()
  const globalStore = useGlobalStore()

  const logout = async (): Promise<void> => {
    globalStore.resetStore()

    await authClient.signOut()

    await navigateTo('/auth/sign-in')
  }

  return {
    logout,
  }
}
