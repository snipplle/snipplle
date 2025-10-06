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

        <div
          class="bg-default border border-light-gray-800 w-full h-full rounded-lg"
        ></div>
      </div>
    </NuxtLayout>
  </ClientOnly>
</template>

<script setup lang="ts">
  import { catppuccinMocha } from '@catppuccin/codemirror'

  const { params } = useRoute()
  const globalStore = useGlobalStore()
  const { listen } = useToolbarEvent()

  const snippets = ref<any[]>([])
  const selectedSnippets = ref<any[]>([])

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

  function selectSnippet(selectedSnippet: any): void {
    selectedSnippets.value.push(selectedSnippet)
    snippets.value = snippets.value.filter(
      (item) => item.id !== selectedSnippet.id,
    )
  }

  function deselectSnippet(snippet: any): void {
    selectedSnippets.value = selectedSnippets.value.filter(
      (item) => item.id !== snippet.id,
    )
    snippets.value.push(snippet)
  }
</script>
