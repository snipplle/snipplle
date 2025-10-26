import type { UsePermission } from '@/types/global.types'

export async function usePermission(scope: string): Promise<UsePermission> {
  const { SELF_HOSTED } = useRuntimeConfig().public

  if (SELF_HOSTED === 'true') {
    return {
      hasAccess: true,
    }
  }

  const { data } = await useFetch('/api/usage', {
    method: 'get',
    query: {
      scope,
    },
  })

  if (!data.value?.isExceeded) {
    return {
      hasAccess: true,
    }
  }

  return {
    hasAccess: false,
  }
}
