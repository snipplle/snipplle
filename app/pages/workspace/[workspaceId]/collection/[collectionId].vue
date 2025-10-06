<template>
  <ClientOnly>
    <NuxtLayout name="editor" :title="collection?.name">
      <div class="flex h-full space-x-2">
        <div class="flex flex-col w-full space-y-2">
          <div
            class="bg-default border border-light-gray-800 w-full h-full p-2 rounded-lg space-y-2"
          >
            <div
              v-for="snippet in snippets"
              :key="snippet.id"
              class="bg-light-gray-800 border border-light-gray-700 p-3 rounded-md space-y-2"
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
                      @click="getSnippetPreview(snippet.snippet_url)"
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
            class="bg-default border border-light-gray-800 w-full h-full p-2 rounded-lg space-y-2"
          >
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
                      @click="getSnippetPreview(snippet.snippet_url)"
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
  const { beautifyCode } = useCodeFormat()

  const snippets = ref<any[]>([])
  const selectedSnippets = ref<any[]>([])
  const previewCode = ref<string>('')

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

  async function getSnippetPreview(url: string): Promise<void> {
    if (!url) {
      return
    }

    const response = await fetch(url)

    const code = await response.text()

    previewCode.value = beautifyCode(code)
  }

  function selectSnippet(snippet: any): void {
    selectedSnippets.value.push(snippet)

    snippets.value = snippets.value.filter((item) => item.id !== snippet.id)
  }

  function deselectSnippet(snippet: any): void {
    selectedSnippets.value = selectedSnippets.value.filter(
      (item) => item.id !== snippet.id,
    )

    snippets.value.push(snippet)
  }
</script>
