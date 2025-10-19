<template>
  <ClientOnly>
    <NuxtLayout name="editor" :title="snippet.name" :versions="snippetVersions">
      <div class="h-full">
        <Codemirror
          v-model="snippetCode"
          class="editor"
          :style="{
            height: '100%',
            padding: '12px',
            border: '1px solid #24273a',
          }"
          :extensions="extensions"
        />
      </div>
    </NuxtLayout>
  </ClientOnly>
</template>

<script setup lang="ts">
  import { Codemirror } from 'vue-codemirror'
  import { catppuccinMocha } from '@catppuccin/codemirror'

  import { LazyEditSnippet } from '#components'

  const { params } = useRoute()
  const overlay = useOverlay()
  const globalStore = useGlobalStore()
  const { beautifyCode, minifyCode } = useCodeFormat()
  const { listen } = useToolbarEvent()
  const toast = useToast()

  const modal = overlay.create(LazyEditSnippet)

  let extensions = [catppuccinMocha]
  const originalSnippetCode = ref('')
  const snippetCode = ref('')

  const { data: snippet, refresh } = await useFetch<any>(
    `/api/snippet/${params.snippetId}`,
    {
      method: 'get',
      query: {
        workspaceId: globalStore.activeWorkspace?.id,
      },
    },
  )

  const { data: snippetVersions } = await useFetch<any>(
    `/api/snippet/version`,
    {
      method: 'get',
      query: {
        workspaceId: globalStore.activeWorkspace?.id,
        snippetId: snippet.value?.id,
      },
    },
  )

  watch(
    () => snippet.value?.snippet_file,
    async (fileUrl) => {
      if (!fileUrl) {
        snippetCode.value = ''
        extensions = [...extensions, languages[snippet.value.language || 'js']]

        return
      }

      const response = await fetch(fileUrl)
      const code = await response.text()

      originalSnippetCode.value = code
      snippetCode.value = beautifyCode(code)
      extensions = [...extensions, languages[snippet.value.language || 'js']]
    },
    {
      deep: true,
      immediate: true,
    },
  )

  listen('toolbar:change-version', changeVersion)
  listen('toolbar:edit', openEditModal)
  listen('toolbar:save', saveSnippet)

  async function changeVersion(versionId: string): Promise<void> {
    const version = await $fetch(`/api/snippet/version/${versionId[0]}`, {
      method: 'get',
    })

    if (!version?.snippet_file) {
      snippetCode.value = ''

      return
    }

    const response = await fetch(version?.snippet_file)
    const code = await response.text()

    snippetCode.value = beautifyCode(code)
  }

  function openEditModal(): void {
    modal.open({
      snippet: snippet.value,
      refreshCallback: refresh,
    })
  }

  async function saveSnippet(): Promise<void> {
    const escapedOriginal = minifyCode(originalSnippetCode.value)
    const escapedCode = minifyCode(snippetCode.value)

    if (escapedOriginal === escapedCode) {
      toast.add({
        title: 'Oops',
        description: 'Snippet code is not changed',
        color: 'error',
        icon: 'i-hugeicons-fire',
        duration: 1500,
      })

      return
    }

    if (!escapedCode.length) {
      toast.add({
        title: 'Oops',
        description: 'Snippet code is empty',
        color: 'error',
        icon: 'i-hugeicons-fire',
        duration: 1500,
      })

      return
    }

    try {
      await $fetch(`/api/snippet/${snippet.value?.id}`, {
        method: 'PUT' as any,
        body: {
          slug: params.snippetId,
          workspaceId: globalStore.activeWorkspace?.id,
          snippetCode: escapedCode,
          language: snippet.value?.language,
        },
      })

      toast.add({
        title: 'Success',
        description: 'Snippet saved successfully',
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

<style>
  .editor .cm-editor {
    border: 1px solid #24273a;
  }

  .editor .cm-editor,
  .editor .cm-gutter {
    background-color: #181923;
    padding: 4px;
    height: 100%;
  }

  .editor .cm-activeLineGutter {
    background-color: transparent !important;
  }

  .editor .cm-activeLine {
    border-radius: 4px !important;
  }

  .editor .cm-editor,
  .editor .cm-scroller {
    border-radius: 8px;
  }

  .editor.cm-lineNumbers {
    font-size: 12px !important;
  }
</style>
