import type { UsePermission } from '@/types/global.types'

export async function usePermission(): Promise<UsePermission> {
  const { SELF_HOSTED } = useRuntimeConfig().public

  const { data } = await useFetch('/api/usage')

  if (SELF_HOSTED === 'true') {
    return {
      hasAccess: true,
    }
  }

  return {
    hasAccess: false,
  }
}
