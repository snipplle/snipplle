<template>
  <ClientOnly>
    <div class="p-2 space-y-6">
      <div class="flex flex-col space-y-2">
        <p class="text-xs font-semibold">Snippet URL (CLI)</p>

        <div class="bg-neutral-700 w-full p-1 rounded-lg">
          <div
            class="bg-neutral-800 w-full p-1.5 flex items-center justify-between rounded-md"
          >
            <p class="text-sm">{{ workspace }}/{{ snippet?.slug }}@latest</p>

            <UButton
              icon="i-hugeicons-copy-01"
              color="neutral"
              variant="link"
              size="sm"
              @click="copySnippetURL('latest')"
            />
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <p class="text-xs font-semibold">Available versions</p>

        <div
          v-for="version in versions"
          :key="version.id"
          class="bg-neutral-700 w-full p-1 rounded-lg"
        >
          <div
            class="bg-neutral-800 w-full px-2 flex items-center justify-between rounded-md"
          >
            <p class="text-xs">
              {{ workspace }}/{{ snippet?.slug }}@{{ version.version }}
            </p>

            <UButton
              icon="i-hugeicons-copy-01"
              color="neutral"
              variant="link"
              size="sm"
              @click="copySnippetURL(version.version)"
            />
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  const props = defineProps<{
    snippet: any
  }>()

  const globalStore = useGlobalStore()
  const { copy } = useClipboard()
  const toast = useToast()

  const { data: versions } = await useFetch('/api/snippet/version', {
    method: 'get',
    query: {
      workspaceId: globalStore.activeWorkspace?.id,
      snippetId: props.snippet.id,
    },
  })

  const workspace = computed(() => {
    return globalStore.activeWorkspace?.slug
  })

  function copySnippetURL(version: string | number): void {
    copy(`${workspace.value}/${props.snippet.slug}@${version}`)

    toast.add({
      title: 'Success',
      description: 'Snippet URL copied to clipboard',
      color: 'success',
      icon: 'i-hugeicons-checkmark-circle-01',
      duration: 1500,
    })
  }
</script>
