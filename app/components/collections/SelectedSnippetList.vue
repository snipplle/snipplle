<template>
  <ClientOnly>
    <div
      class="bg-default border border-light-gray-800 w-full h-full p-2 rounded-lg space-y-2"
    >
      <div v-if="selectedSnippets?.length" class="space-y-2">
        <div
          v-for="snippet in selectedSnippets"
          :key="snippet.id"
          class="bg-light-gray-800 border border-light-gray-700 p-3 rounded-md space-y-2"
        >
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold">{{ snippet.name }}</p>

            <div class="space-x-1">
              <UPopover>
                <UButton
                  icon="i-hugeicons-file-01"
                  size="sm"
                  color="neutral"
                  variant="link"
                  @click="getSnippetPreview(snippet)"
                />

                <template #content>
                  <div class="p-2">
                    <CodeViewer
                      :content="previewCode"
                      :is-preview="true"
                      :extensions="extensions"
                      :styles="{
                        fontSize: '14px',
                      }"
                    />
                  </div>
                </template>
              </UPopover>

              <UButton
                icon="i-hugeicons-minus-sign"
                size="sm"
                color="neutral"
                variant="link"
                @click="deselectSnippet(snippet)"
              />
            </div>
          </div>

          <div class="space-x-1">
            <UBadge
              v-for="tag in snippet.snippet_tags"
              :key="tag"
              :color="tag.tags.color"
              variant="subtle"
              size="sm"
            >
              {{ tag.tags.name }}
            </UBadge>
          </div>
        </div>
      </div>

      <div
        v-else
        class="h-full flex flex-col items-center justify-center space-y-2"
      >
        <img src="assets/images/Dev.svg" />

        <div class="flex flex-col items-center">
          <h1 class="font-semibold">No added snippets</h1>
          <p class="text-sm text-neutral-400">
            Add snippets to this collection.
          </p>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  defineProps<{
    selectedSnippets: any[]
    extensions: any[]
  }>()

  const emits = defineEmits(['deselectSnippet'])

  const globalStore = useGlobalStore()
  const { beautifyCode } = useCodeFormat()

  const previewCode = ref<string>('')

  async function getSnippetPreview(snippet: any): Promise<void> {
    const snippetData = await $fetch(`/api/snippet/version/latest`, {
      method: 'get',
      query: {
        snippetId: snippet.id,
        workspaceId: globalStore.activeWorkspace?.id,
      },
    })

    const response = await fetch(snippetData.snippet_file)

    const code = await response.text()

    previewCode.value = beautifyCode(code)
  }

  function deselectSnippet(snippet: any): void {
    emits('deselectSnippet', snippet)
  }
</script>
