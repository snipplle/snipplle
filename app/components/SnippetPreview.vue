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
          <SandpackProvider
            :theme="{
              colors: {
                surface1: '#1f1f27',
              },
            }"
            class="!rounded-md"
          >
            <SandpackLayout
              class="group min-h-24 text-xs !border-none !rounded-md"
            >
              <SandpackCodeViewer :code="code" class="rounded-md" />
            </SandpackLayout>
          </SandpackProvider>

          <div class="flex items-center justify-between pt-2">
            <h1 class="px-2 font-semibold">Snippet name</h1>

            <div class="space-x-1">
              <UButton
                icon="i-hugeicons-copy-01"
                color="neutral"
                variant="subtle"
                size="sm"
                @click="copyCode"
              />

              <DownloadSnippet />
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </ClientOnly>
</template>

<script setup lang="ts">
  import {
    SandpackProvider,
    SandpackLayout,
    SandpackCodeViewer,
  } from 'sandpack-vue3'

  const props = defineProps<{
    code: string
    name: string
  }>()

  const { copy } = useClipboard()
  const toast = useToast()

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
