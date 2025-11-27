<template>
  <ClientOnly>
    <div
      class="bg-neutral-800 border border-neutral-700 p-2 rounded-md flex items-center justify-between"
    >
      <h1 class="ml-2 font-medium">{{ workspace.workspaces.name }}</h1>

      <UButton variant="link" type="button" size="sm" @click="leaveWorkspace">
        Leave
      </UButton>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  const props = defineProps<{
    workspace: any
  }>()

  const emits = defineEmits(['onWorkspaceLeft'])

  const toast = useToast()

  async function leaveWorkspace(): Promise<void> {
    try {
      await $fetch('/api/workspace/member/leave', {
        method: 'POST',
        body: {
          workspaceId: props.workspace.workspace_id,
        },
      })

      emits('onWorkspaceLeft')

      toast.add({
        title: 'Success',
        description: 'Workspace left successfully',
        color: 'success',
        icon: 'i-hugeicons-checkmark-circle-01',
        duration: 1500,
      })
    } catch (error: any) {
      toast.add({
        title: 'Oops',
        description: error.statusMessage,
        color: 'error',
        icon: 'i-hugeicons-fire',
        duration: 1500,
      })
    }
  }
</script>
