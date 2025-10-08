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
  const { beautifyCode, minifyCode } = useCodeFormat()
  const toast = useToast()

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
    languages[collection?.value?.language || 'js'],
  ]

  const { data } = await useFetch<any>(`/api/snippet`, {
    method: 'get',
    query: {
      lang: collection?.value?.language,
      page: 1,
      itemsPerPage: 10,
      withUrl: 'true',
    },
  })

  watch(
    () => collection.value,
    async (newData) => {
      if (!newData) {
        return
      }

      selectedSnippets.value = newData.snippets

      for (const snippet of selectedSnippets.value) {
        resultCode.value = {
          ...resultCode.value,
          [snippet.id]: await getSnippetCode(snippet),
        }
      }
    },
    { immediate: true },
  )

  watch(
    () => data.value,
    (newData) => {
      if (!newData) {
        return
      }

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

  listen('toolbar:save', saveCollection)

  async function saveCollection(): Promise<void> {
    const joinedCode = Object.values(resultCode.value).join('\n')
    const escapedCode = minifyCode(joinedCode)

    try {
      await $fetch(`/api/collection/${collection.value?.id}`, {
        method: 'PUT' as any,
        body: {
          slug: params.collectionId,
          workspaceId: globalStore.activeWorkspace?.id,
          collectionCode: escapedCode,
          snippets: selectedSnippets.value.map((item) => ({
            id: item.id,
          })),
          language: collection.value?.language,
        },
      })

      toast.add({
        title: 'Success',
        description: 'Collection saved successfully',
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
