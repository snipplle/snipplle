export const useGlobalStore = defineStore('global', () => {
  const activeWorkspace = ref<string | undefined>()

  function setActiveWorkspace(workspace: string) {
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
