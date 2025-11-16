import type { ActiveWorkspace } from '~/types/global.types'

export const useGlobalStore = defineStore(
  'global',
  () => {
    const activeWorkspace = ref<ActiveWorkspace | undefined>()
    const selectedJoinedWorkspace = ref<ActiveWorkspace | undefined>()
    const previewWorkspaceId = ref<string | undefined>()

    function setActiveWorkspace(workspace: ActiveWorkspace): void {
      activeWorkspace.value = workspace
    }

    function setSelectedJoinedWorkspace(
      workspace: ActiveWorkspace | undefined,
    ): void {
      selectedJoinedWorkspace.value = workspace
    }

    function setPreviewWorkspaceId(workspaceId: string): void {
      previewWorkspaceId.value = workspaceId
    }

    function resetStore(): void {
      activeWorkspace.value = undefined
      selectedJoinedWorkspace.value = undefined
      previewWorkspaceId.value = undefined
    }

    return {
      activeWorkspace,
      selectedJoinedWorkspace,
      previewWorkspaceId,
      setActiveWorkspace,
      setSelectedJoinedWorkspace,
      setPreviewWorkspaceId,
      resetStore,
    }
  },
  {
    persist: true,
  },
)
