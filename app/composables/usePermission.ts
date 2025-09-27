export function usePermission() {
  const { SELF_HOSTED } = useRuntimeConfig().public

  if (SELF_HOSTED === 'true') {
    return {
      hasAccess: true,
    }
  }
}