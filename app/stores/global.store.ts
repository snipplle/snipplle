import type { ActiveWorkspace } from '~/types/global.types'

export const useGlobalStore = defineStore('global', () => {
  const activeWorkspace = ref<ActiveWorkspace | undefined>()

  function setActiveWorkspace(workspace: ActiveWorkspace) {
    activeWorkspace.value = workspace
  }

  function resetStore() {
    activeWorkspace.value = undefined
  }

  return {
    activeWorkspace,
    setActiveWorkspace,
    resetStore
  }
}, {
  persist: true
})
