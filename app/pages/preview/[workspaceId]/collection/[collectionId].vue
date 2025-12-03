<template>
  <ClientOnly>
    <NuxtLayout name="preview" :title="data?.name">
      <div class="flex flex-col sm:flex-row h-full">
        <SelectedSnippetList
          :selected-snippets="selectedSnippets"
          :extensions="extensions"
          :has-action="false"
        />

        <USeparator :orientation="isMobile ? 'horizontal' : 'vertical'" />

        <div
          v-if="collectionCode.length"
          class="flex flex-col w-full overflow-auto"
        >
          <div
            v-for="code in collectionCode"
            :key="code.id"
            class="flex flex-col h-full last:border-b-0 border-b border-neutral-800"
          >
            <div class="bg-neutral-900 border-b border-neutral-800 p-2">
              <h1 class="text-sm font-bold">{{ code.name }}</h1>
            </div>

            <CodeViewer
              :content="code.content"
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
        </div>

        <div v-else class="w-full bg-default"></div>
      </div>
    </NuxtLayout>
  </ClientOnly>
</template>

<script setup lang="ts">
  import { catppuccinMocha } from '@catppuccin/codemirror'

  const { params } = useRoute()
  const globalStore = useGlobalStore()
  const isMobile = useMediaQuery('(max-width: 640px)')

  const selectedSnippets = ref<any[]>([])
  const collectionCode = ref<any[]>([])

  const { data } = await useFetch<any>(
    `/api/collection/${params.collectionId}`,
    {
      method: 'get',
      query: {
        workspaceId: globalStore.previewWorkspaceId,
      },
    },
  )

  const extensions = [catppuccinMocha, languages[data?.value?.language || 'js']]

  watch(
    () => data.value,
    async (newData) => {
      if (!newData) {
        return
      }

      selectedSnippets.value = newData.snippets

      collectionCode.value = await Promise.all(
        newData.snippets.map(async (item: any) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          content: await getSnippetCode(item),
        })),
      )
    },
    { immediate: true },
  )

  async function getSnippetCode(snippet: any): Promise<string> {
    const snippetData = await $fetch(`/api/snippet/version/latest`, {
      method: 'get',
      query: {
        snippetId: snippet.id,
        workspaceId: globalStore.activeWorkspace?.id,
        path: snippet.path,
      },
    })

    const response = await fetch(snippetData)

    const snippetCode = await response.text()

    return snippetCode
  }
</script>
