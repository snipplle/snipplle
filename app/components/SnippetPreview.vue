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
                surface1: '#1f1f27'
              }
            }"
            class="!rounded-md"
          >
            <SandpackLayout class="group min-h-24 text-xs !border-none !rounded-md">
              <SandpackCodeViewer :code="code" class="rounded-md" />
            </SandpackLayout>
          </SandpackProvider>
        </div>
      </template>
    </UModal>
  </ClientOnly>
</template>

<script setup lang="ts">
  import {
    SandpackProvider,
    SandpackLayout,
    SandpackCodeViewer
  } from 'sandpack-vue3'

  defineProps<{
    code: string
  }>()
</script>