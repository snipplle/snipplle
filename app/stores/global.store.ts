import type { ActiveWorkspace } from '~/types/global.types'

export const useGlobalStore = defineStore(
  'global',
  () => {
    const activeWorkspace = ref<ActiveWorkspace | undefined>()
    const previewWorkspaceId = ref<string | undefined>()

    function setActiveWorkspace(workspace: ActiveWorkspace): void {
      activeWorkspace.value = workspace
    }

    function setPreviewWorkspaceId(workspaceId: string): void {
      previewWorkspaceId.value = workspaceId
    }

    function resetStore(): void {
      activeWorkspace.value = undefined
      previewWorkspaceId.value = undefined
    }

    return {
      activeWorkspace,
      previewWorkspaceId,
      setActiveWorkspace,
      setPreviewWorkspaceId,
      resetStore,
    }
  },
  {
    persist: true,
  },
)
