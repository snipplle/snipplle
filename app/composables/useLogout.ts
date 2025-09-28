import type { UseLogout } from '@/types/global.types'

export function useLogout(): UseLogout {
  const supabase = useSupabaseClient()
  const globalStore = useGlobalStore()

  const logout = async (): Promise<void> => {
    globalStore.resetStore()

    await supabase.auth.signOut()

    await navigateTo('/auth/signin')
  }

  return {
    logout,
  }
}
