<template>
  <ClientOnly>
    <UModal>
      <template #content>
        <div class="p-1">
          <UTabs :items="items" variant="link">
            <template #content="{ item }">
              <div v-if="item.value === 'preview'" class="p-2">
                <div v-if="preview" class="relative">
                  <CodeViewer
                    :content="preview"
                    :extensions="extensions"
                    :is-preview="true"
                    :styles="{
                      maxHeight: '300px',
                      fontSize: '12px',
                      overflow: 'auto',
                    }"
                  />

                  <UButton
                    icon="i-hugeicons-copy-01"
                    color="neutral"
                    variant="link"
                    size="sm"
                    class="absolute top-2 right-2"
                    @click="copyCode"
                  />
                </div>

                <div
                  v-else
                  class="min-h-40 flex flex-col items-center justify-center"
                >
                  <UIcon name="i-hugeicons-document-code" class="text-3xl" />
                  <h1 class="font-semibold">Preview not found</h1>
                  <p class="text-sm text-neutral-400">
                    Add a code to your snippet to see it preview here.
                  </p>
                </div>
              </div>

              <DownloadSnippet v-if="item.value === 'cli'" :snippet="snippet" />
            </template>
          </UTabs>
        </div>
      </template>
    </UModal>
  </ClientOnly>
</template>

<script setup lang="ts">
  import type { TabsItem } from '@nuxt/ui'
  import { catppuccinMocha } from '@catppuccin/codemirror'

  const props = defineProps<{
    snippet: any
    code: string
  }>()

  const { copy } = useClipboard()
  const toast = useToast()
  const { beautifyCode } = useCodeFormat()

  const items = ref<TabsItem[]>([
    {
      label: 'Preview',
      value: 'preview',
    },
    {
      label: 'CLI',
      value: 'cli',
    },
  ])
  const extensions = [
    catppuccinMocha,
    languages[props.snippet.language || 'js'],
  ]
  const preview = ref()

  watch(
    () => props.code,
    (newCode) => {
      if (!newCode) {
        return
      }

      preview.value = beautifyCode(newCode)
    },
    {
      immediate: true,
    },
  )

  function copyCode(): void {
    copy(props.code)

    toast.add({
      title: 'Success',
      description: 'Snippet code copied to clipboard',
      color: 'success',
      icon: 'i-hugeicons-checkmark-circle-01',
      duration: 1500,
    })
  }
</script>

<style>
  .preview .cm-editor,
  .preview .cm-scrolled {
    border-radius: 8px !important;
  }
</style>
