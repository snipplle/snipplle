<template>
  <ClientOnly>
    <NuxtLayout name="preview" :title="collection?.name">
      <div class="flex flex-col sm:flex-row h-full">
        <SelectedSnippetList
          :selected-snippets="selectedSnippets"
          :extensions="extensions"
          :has-action="false"
        />

        <USeparator :orientation="isMobile ? 'horizontal' : 'vertical'" />

        <CodeViewer
          :content="resultCode ? Object.values(resultCode).join('\n') : ''"
          :extensions="extensions"
          :styles="{
            height: '100%',
            fontSize: '12px',
            overflow: 'auto',
          }"
          view="public-view"
          class="w-full"
        />
      </div>
    </NuxtLayout>
  </ClientOnly>
</template>

<script setup lang="ts">
  import { catppuccinMocha } from '@catppuccin/codemirror'

  const { params } = useRoute()
  const globalStore = useGlobalStore()
  const { beautifyCode } = useCodeFormat()
  const isMobile = useMediaQuery('(max-width: 640px)')

  const selectedSnippets = ref<any[]>([])
  const resultCode = ref()

  const { data: collection } = await useFetch<any>(
    `/api/collection/${params.collectionId}`,
    {
      method: 'get',
      query: {
        workspaceId: globalStore.previewWorkspaceId,
      },
    },
  )

  const { data: collectionSnippets } = await useFetch<any>(
    `/api/collection/${collection?.value?.id}/snippet`,
    {
      method: 'get',
      query: {
        workspaceId: globalStore.activeWorkspace?.id,
      },
    },
  )

  const extensions = [
    catppuccinMocha,
    languages[collection?.value?.language || 'js'],
  ]

  watch(
    () => collectionSnippets.value,
    async (newData) => {
      if (!newData) {
        return
      }

      selectedSnippets.value = newData

      for (const snippet of selectedSnippets.value) {
        resultCode.value = {
          ...resultCode.value,
          [snippet.id]: await getSnippetCode(snippet),
        }
      }
    },
    { immediate: true },
  )

  async function getSnippetCode(snippet: any): Promise<string> {
    const snippetData = await $fetch(`/api/snippet/version/latest`, {
      method: 'get',
      query: {
        snippetId: snippet.id,
        workspaceId: globalStore.activeWorkspace?.id,
      },
    })

    const response = await fetch(snippetData.snippet_file)

    const snippetCode = await response.text()

    return beautifyCode(snippetCode)
  }
</script>
