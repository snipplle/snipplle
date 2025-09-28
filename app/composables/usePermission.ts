import type { UsePermission } from '@/types/global.types'

export function usePermission(): UsePermission {
  const { SELF_HOSTED } = useRuntimeConfig().public

  if (SELF_HOSTED === 'true') {
    return {
      hasAccess: true,
    }
  }

  return {
    hasAccess: false,
  }
}
