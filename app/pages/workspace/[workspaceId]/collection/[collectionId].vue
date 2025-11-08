<template>
  <ClientOnly>
    <NuxtLayout name="editor" :title="collection?.name" :has-access="true">
      <div class="flex flex-col sm:flex-row h-full">
        <div class="flex flex-row sm:flex-col w-full">
          <AvailableSnippetList
            :snippets="snippets"
            :extensions="extensions"
            @select-snippet="selectSnippet"
          />

          <USeparator :orientation="isMobile ? 'vertical' : 'horizontal'" />

          <SelectedSnippetList
            :selected-snippets="selectedSnippets"
            :extensions="extensions"
            @deselect-snippet="deselectSnippet"
          />
        </div>

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

  import { LazyEditCollection } from '#components'

  const { params } = useRoute()
  const overlay = useOverlay()
  const globalStore = useGlobalStore()
  const { listen } = useToolbarEvent()
  const { beautifyCode, minifyCode } = useCodeFormat()
  const toast = useToast()
  const isMobile = useMediaQuery('(max-width: 640px)')

  const modal = overlay.create(LazyEditCollection)

  const snippets = ref<any[]>([])
  const selectedSnippets = ref<any[]>([])
  const resultCode = ref()

  const { data: collection, refresh } = await useFetch<any>(
    `/api/collection/${params.collectionId}`,
    {
      method: 'get',
      query: {
        workspaceId: globalStore.activeWorkspace?.id,
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

  const { data } = await useFetch<any>(`/api/snippet`, {
    method: 'get',
    query: {
      lang: collection?.value?.language,
      page: 1,
      itemsPerPage: 10,
    },
  })

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

  watch(
    () => data.value,
    (newData) => {
      if (!newData) {
        return
      }

      snippets.value = newData.snippets.filter(
        (item: any) =>
          item.path &&
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

  listen('toolbar:edit', openEditModal)
  listen('toolbar:save', saveCollection)

  function openEditModal(): void {
    modal.open({
      collection: collection.value,
      refreshCallback: refresh,
    })
  }

  async function saveCollection(): Promise<void> {
    const joinedCode = Object.values(resultCode.value).join('\n')
    const escapedCode = minifyCode(joinedCode)

    if (!escapedCode.length) {
      toast.add({
        title: 'Oops',
        description: 'Collection code is empty',
        color: 'error',
        icon: 'i-hugeicons-fire',
        duration: 1500,
      })

      return
    }

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
