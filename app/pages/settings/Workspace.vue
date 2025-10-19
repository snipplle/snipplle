<template>
  <ClientOnly>
    <div class="min-w-xl max-w-xl mx-auto space-y-10">
      <div class="space-y-6">
        <div>
          <h1 class="font-semibold">General</h1>
          <p class="text-sm text-neutral-400">
            Your default workspace information and preferences.
          </p>
        </div>

        <div class="space-y-4">
          <UFormField label="Name">
            <UInput
              variant="subtle"
              class="w-full"
              :default-value="data?.name"
              disabled
            />
          </UFormField>
        </div>
      </div>

      <USeparator />

      <div class="space-y-6">
        <div>
          <h1 class="font-semibold">Team</h1>
          <p class="text-sm text-neutral-400">
            Update your team settings, such as adding or removing members.
          </p>
        </div>

        <div class="space-y-2">
          <div class="flex flex-col max-h-40 overflow-auto space-y-2">
            <MemberCard
              v-for="member in members"
              :key="member.user_id"
              :member="member"
              :workspace-id="data?.id"
              :user-id="user?.id"
            />
          </div>

          <AddMember :workspace-id="data?.id" />
        </div>
      </div>

      <USeparator />

      <div class="space-y-6">
        <div>
          <h1 class="font-semibold">Joined Workspaces</h1>
          <p class="text-sm text-neutral-400">
            Update your joined workspaces, such as removing workspaces.
          </p>
        </div>

        <div class="space-y-2">
          <div
            v-if="joinedWorkspaces.length"
            class="flex flex-col max-h-40 overflow-auto space-y-2"
          >
            <JoinedWorkspaceCard
              v-for="workspace in joinedWorkspaces"
              :key="workspace.id"
              :workspace="workspace"
            />
          </div>

          <div v-else class="flex flex-col items-center justify-center">
            <UIcon name="i-hugeicons-office" size="32" />
            <h1 class="font-medium">No Joined Workspaces</h1>
            <p class="text-sm text-neutral-400">
              You are not a member of any workspaces.
            </p>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'setting',
  })

  const user = useSupabaseUser()

  const { data } = await useFetch('/api/workspace/default', {
    method: 'GET',
  })

  const { data: members } = await useFetch('/api/workspace/member', {
    method: 'GET',
    params: {
      workspaceId: data.value?.id,
    },
  })

  const { data: workspaces } = await useFetch('/api/workspace/joined', {
    method: 'GET',
  })

  const joinedWorkspaces = computed(() => {
    return (
      workspaces.value?.filter(
        (workspace) => workspace.workspace_id !== data.value?.id,
      ) || []
    )
  })
</script>
