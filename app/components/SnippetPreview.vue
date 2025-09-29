<template>
  <ClientOnly>
    <UModal>
      <UButton
        icon="i-hugeicons-view"
        class="hidden group-hover:block p-0"
        color="neutral"
        variant="link"
        size="sm"
        @click.stop
      />

      <template #content>
        <div class="p-1">
          <UTabs :items="items" variant="link">
            <template #content="{ item }">
              <div v-if="item.value === 'preview'">
                <SandpackProvider
                  v-if="code"
                  :theme="{
                    colors: {
                      surface1: '#1f1f27',
                    },
                  }"
                  class="!rounded-md !p-2"
                >
                  <SandpackLayout
                    class="group min-h-24 text-xs !border-none !rounded-md"
                  >
                    <SandpackCodeViewer :code="preview" class="rounded-md" />

                    <UButton
                      icon="i-hugeicons-copy-01"
                      color="neutral"
                      variant="link"
                      size="sm"
                      class="absolute top-2 right-2"
                      @click="copyCode"
                    />
                  </SandpackLayout>
                </SandpackProvider>

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

              <DownloadSnippet v-if="item.value === 'cli'" />
            </template>
          </UTabs>
        </div>
      </template>
    </UModal>
  </ClientOnly>
</template>

<script setup lang="ts">
  import type { TabsItem } from '@nuxt/ui'
  import {
    SandpackProvider,
    SandpackLayout,
    SandpackCodeViewer,
  } from 'sandpack-vue3'

  const props = defineProps<{
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

  const preview = computed(() => {
    return beautifyCode(props.code)
  })

  function copyCode(): void {
    copy(props.code)

    toast.add({
      title: 'Success',
      description: 'Snippet code copied to clipboard',
      color: 'success',
      icon: 'i-hugeicons-checkmark-circle-01',
    })
  }
</script>
