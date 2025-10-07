<template>
  <ClientOnly>
    <NuxtLayout name="editor" :title="collection?.name">
      <div class="flex h-full space-x-2">
        <div class="flex flex-col w-full space-y-2">
          <AvailableSnippetList
            :snippets="snippets"
            :extensions="extensions"
            @select-snippet="selectSnippet"
          />
          <SelectedSnippetList
            :selected-snippets="selectedSnippets"
            :extensions="extensions"
            @deselect-snippet="deselectSnippet"
          />
        </div>

        <CodeViewer
          :content="resultCode ? Object.values(resultCode).join('\n') : ''"
          :extensions="extensions"
          :styles="{
            height: '100%',
            fontSize: '12px',
            overflow: 'auto',
          }"
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
  const { listen } = useToolbarEvent()
  const { beautifyCode } = useCodeFormat()

  const snippets = ref<any[]>([])
  const selectedSnippets = ref<any[]>([])
  const resultCode = ref()

  const { data: collection } = await useFetch<any>(
    `/api/collection/${params.collectionId}`,
    {
      method: 'get',
      query: {
        workspaceId: globalStore.activeWorkspace?.id,
      },
    },
  )

  const extensions = [
    catppuccinMocha,
    languages[collection?.value.language || 'js'],
  ]

  const { data } = await useFetch<any>(`/api/snippet`, {
    method: 'get',
    query: {
      lang: collection?.value.language,
      page: 1,
      itemsPerPage: 10,
      withUrl: 'true',
    },
  })

  watch(
    () => collection.value,
    (newData) => {
      selectedSnippets.value = newData.snippets
    },
    { immediate: true },
  )

  watch(
    () => data.value,
    (newData) => {
      snippets.value = newData.snippets.filter(
        (item: any) =>
          !selectedSnippets.value.some((selected) => selected.id === item.id),
      )
    },
    { immediate: true },
  )

  async function selectSnippet(selectedSnippet: any): Promise<void> {
    selectedSnippets.value.push(selectedSnippet)
    snippets.value = snippets.value.filter(
      (item) => item.id !== selectedSnippet.id,
    )

    resultCode.value = {
      [selectedSnippet.id]: await getSnippetCode(selectedSnippet),
    }
  }

  async function deselectSnippet(snippet: any): Promise<void> {
    selectedSnippets.value = selectedSnippets.value.filter(
      (item) => item.id !== snippet.id,
    )
    snippets.value.push(snippet)

    resultCode.value = Object.fromEntries(
      Object.entries(resultCode.value).filter(([key]) => key !== snippet.id),
    )
  }

  async function getSnippetCode(snippet: any): Promise<string> {
    const response = await fetch(snippet.snippet_url)

    const snippetCode = await response.text()

    return beautifyCode(snippetCode)
  }
</script>
