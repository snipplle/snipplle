import type { ActiveWorkspace } from '~/types/global.types'

export const useGlobalStore = defineStore(
  'global',
  () => {
    const activeWorkspace = ref<ActiveWorkspace | undefined>()

    function setActiveWorkspace(workspace: ActiveWorkspace): void {
      activeWorkspace.value = workspace
    }

    function resetStore(): void {
      activeWorkspace.value = undefined
    }

    return {
      activeWorkspace,
      setActiveWorkspace,
      resetStore,
    }
  },
  {
    persist: true,
  },
)
