<template>
  <ClientOnly>
    <NuxtLayout name="preview" :title="data?.name">
      <div class="h-full">
        <CodeViewer
          :content="snippetCode"
          :extensions="extensions"
          view="public-view"
          has-copy
        />
      </div>
    </NuxtLayout>
  </ClientOnly>
</template>

<script setup lang="ts">
  import { catppuccinMocha } from '@catppuccin/codemirror'

  const { params } = useRoute()
  const globalStore = useGlobalStore()

  const { data } = await useFetch<any>(`/api/snippet/${params.snippetId}`, {
    method: 'GET',
    query: {
      workspaceId: globalStore.previewWorkspaceId,
    },
  })

  let extensions = [catppuccinMocha, languages[data.value?.language || 'js']]
  const snippetCode = ref('')

  watch(
    () => data.value?.snippet_file,
    async (fileUrl) => {
      if (!fileUrl) {
        snippetCode.value = ''
        extensions = [...extensions, languages[data.value?.language || 'js']]

        return
      }

      const response = await fetch(fileUrl)
      const code = await response.text()

      snippetCode.value = code
      extensions = [...extensions, languages[data.value?.language || 'js']]
    },
    {
      deep: true,
      immediate: true,
    },
  )
</script>
