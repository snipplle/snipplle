<template>
  <ClientOnly>
    <NuxtLayout name="editor">
      <div class="h-full">
        <SandpackProvider
          :theme="{
            colors: {
              surface1: '#181923',
            },
          }"
          :options="{
            autorun: false,
            classes: {
              'sp-preview-container': '!bg-[#181923]',
              'sp-code-editor': '!min-w-150 !w-full',
            },
          }"
          template="vanilla-ts"
          :files="files"
          class="!rounded-md !h-full"
        >
          <SandpackLayout
            class="group min-h-24 h-full text-xs !border border-neutral-700 !rounded-md"
          >
            <div class="flex flex-col" :class="{ '!w-full': !previewEnabled }">
              <SandpackCodeEditor
                :show-tabs="false"
                :show-line-numbers="true"
                class="rounded-tl-md h-full max-h-[calc(100vh-321px)]"
              />
              <USeparator
                orientation="horizontal"
                :ui="{
                  border: 'border-zinc-800',
                }"
              />
              <SandpackConsole :standalone="true" class="!h-40" />
            </div>
            <SandpackPreview
              v-if="previewEnabled"
              :show-open-in-code-sandbox="false"
              class="!h-full"
            />
          </SandpackLayout>
          <CodeEditorListener
            @change="(newCode) => (files['index.ts'] = newCode)"
          />
        </SandpackProvider>
      </div>
    </NuxtLayout>
  </ClientOnly>
</template>

<script setup lang="ts">
  import {
    SandpackProvider,
    SandpackLayout,
    SandpackCodeEditor,
    SandpackPreview,
    SandpackConsole,
  } from 'sandpack-vue3'
  import { LazyEditSnippet } from '#components'

  const { params } = useRoute()
  const overlay = useOverlay()
  const globalStore = useGlobalStore()
  const { beautifyCode, minifyCode } = useCodeFormat()
  const { listen } = useToolbarEvent()

  const modal = overlay.create(LazyEditSnippet)

  const previewEnabled = ref(false)
  const files = ref({
    'index.html': editorHtml,
    'index.ts': '',
  })
  const language = ref('ts')

  const { data: snippet } = await useFetch(
    `/api/snippet/${params.snippetId}?workspaceId=${globalStore.activeWorkspace?.id}`,
    {
      method: 'get',
    },
  )

  watch(
    () => snippet.value?.snippetFile,
    async (fileUrl) => {
      if (!fileUrl) {
        files.value['index.ts'] = ''

        return
      }

      const response = await fetch(fileUrl)
      const code = await response.text()

      files.value['index.ts'] = beautifyCode(code)
    },
    {
      deep: true,
      immediate: true,
    },
  )

  listen('toolbar:preview', enablePreview)
  listen('toolbar:edit', modal.open)
  listen('toolbar:save', saveSnippet)

  function enablePreview(): void {
    previewEnabled.value = !previewEnabled.value
  }

  async function saveSnippet(): Promise<void> {
    const escapedCode = minifyCode(files.value['index.ts'])

    try {
      await $fetch(`/api/snippet/${params.snippetId}`, {
        method: 'PUT',
        body: {
          workspaceId: globalStore.activeWorkspace?.id,
          snippetCode: escapedCode,
          language: language.value,
        },
      })
    } catch (error) {
      console.log(error)
    }
  }
</script>

<style>
  .cm-lineNumbers {
    font-size: 12px !important;
  }
</style>
