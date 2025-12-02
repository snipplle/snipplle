import type { UsePermission } from '@/types/global.types'

export async function usePermission(
  scope: string,
  meta: Record<string, string> = {},
): Promise<UsePermission> {
  const { SELF_HOSTED } = useRuntimeConfig().public
  const hasAccess = ref(false)

  if (SELF_HOSTED === 'true') {
    hasAccess.value = true

    return {
      hasAccess,
      refresh: async (): Promise<void> => {},
    }
  }

  const { data, refresh } = await useFetch('/api/usage', {
    method: 'get',
    query: {
      scope,
      ...meta,
    },
  })

  watch(
    data,
    (newValue) => {
      if (newValue?.isExceeded) {
        hasAccess.value = false
      } else {
        hasAccess.value = true
      }
    },
    { immediate: true, deep: true },
  )

  return {
    hasAccess,
    refresh,
  }
}
