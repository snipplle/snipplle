<template>
  <ClientOnly>
    <div
      class="bg-default border border-neutral-700 w-full h-full p-2 rounded-lg space-y-2"
    >
      <div v-if="snippets?.length" class="space-y-2">
        <div
          v-for="snippet in snippets"
          :key="snippet.id"
          class="bg-neutral-800 border border-neutral-700 p-3 rounded-md space-y-2"
        >
          <div class="flex items-center justify-between">
            <h1 class="text-sm font-semibold">{{ snippet.name }}</h1>

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
                icon="i-hugeicons-plus-sign"
                size="sm"
                color="neutral"
                variant="link"
                @click="selectSnippet(snippet)"
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

        <div class="flex flex-col items-center text-center">
          <h1 class="font-semibold">No available snippets</h1>
          <p class="text-sm text-neutral-400">
            No snippets found for this collection.
          </p>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  defineProps<{
    snippets: any[]
    extensions: any[]
  }>()

  const emits = defineEmits(['selectSnippet'])

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

  function selectSnippet(snippet: any): void {
    emits('selectSnippet', snippet)
  }
</script>
