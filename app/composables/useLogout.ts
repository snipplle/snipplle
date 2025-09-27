export function useLogout() {
  const supabase = useSupabaseClient()
  const globalStore = useGlobalStore()

  const logout = async () => {
    globalStore.resetStore()
    
    await supabase.auth.signOut()
    
    await navigateTo('/auth/signin')
  }

  return {
    logout
  }
}