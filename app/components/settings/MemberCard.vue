<template>
  <ClientOnly>
    <div
      class="bg-neutral-800 border border-neutral-700 p-2 rounded-lg flex items-center justify-between"
    >
      <div>
        <h1 class="text-sm font-semibold">{{ member.user?.name }}</h1>
        <p class="text-neutral-400 text-sm">{{ member.user?.email }}</p>
      </div>

      <UButton
        v-if="member.user_id !== userId"
        variant="link"
        type="button"
        size="sm"
        icon="i-hugeicons-cancel-01"
        @click="removeMember(member.user_id)"
      />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  const props = defineProps<{
    member: any
    workspaceId: string | undefined
    userId: string | undefined
  }>()

  const emits = defineEmits(['onMemberRemoved'])

  const toast = useToast()

  async function removeMember(userId: string): Promise<void> {
    try {
      await $fetch('/api/workspace/member', {
        method: 'DELETE',
        body: {
          workspaceId: props.workspaceId,
          userId,
        },
      })

      emits('onMemberRemoved')

      toast.add({
        title: 'Success',
        description: 'Member removed successfully',
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
