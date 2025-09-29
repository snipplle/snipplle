<template>
  <ClientOnly>
    <UCard
      :ui="{
        body: 'sm:p-0',
      }"
      class="group cursor-pointer"
      @click="openSnippet"
    >
      <div class="w-full p-0 rounded-md">
        <SandpackProvider
          v-if="snippet.preview"
          :theme="{
            colors: {
              surface1: '#1f1f27',
            },
          }"
          class="card-preview !rounded-t-md !rounded-b-none"
        >
          <SandpackLayout
            class="max-h-40 text-[8px] !border-none !rounded-t-md !rounded-b-none"
          >
            <SandpackCodeViewer
              :code="preview"
              class="rounded-t-md rounded-b-none"
            />
          </SandpackLayout>
        </SandpackProvider>

        <div
          v-else
          class="min-h-32 bg-[#1f1f27] flex items-center justify-center"
        >
          <UIcon
            name="i-hugeicons-document-code"
            class="text-[54px] text-neutral-600"
          />
        </div>
      </div>

      <div class="text-sm p-2.5 space-y-3">
        <div class="flex items-center justify-between">
          <h1 class="font-semibold">{{ snippet.name }}</h1>

          <SnippetPreview :code="snippet.preview" />
        </div>

        <div class="flex items-center justify-between">
          <div class="space-x-1">
            <UBadge
              v-for="tag in tags"
              :key="tag.id"
              :color="tag.color"
              variant="subtle"
              size="sm"
              >{{ tag.name }}</UBadge
            >
          </div>

          <div class="flex items-center space-x-1">
            <p class="text-xs">{{ snippet.downloads }}</p>
            <UIcon name="i-hugeicons-download-01" class="text-lg" />
          </div>
        </div>
      </div>
    </UCard>
  </ClientOnly>
</template>

<script setup lang="ts">
  import type { NavigationFailure, RouteLocationRaw } from 'vue-router'
  import {
    SandpackProvider,
    SandpackLayout,
    SandpackCodeViewer,
  } from 'sandpack-vue3'
  import beautify from 'js-beautify'

  const props = defineProps<{
    snippet: any
  }>()

  const globalStore = useGlobalStore()

  const preview = computed(() => {
    const unescaped = props.snippet.preview
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")

    return beautify(unescaped, {
      indent_size: 2,
      indent_char: ' ',
    })
  })

  const tags = computed(() => {
    const tagList = []

    for (const tag of props.snippet.snippet_tags) {
      tagList.push(tag.tags)
    }

    return tagList
  })

  function openSnippet(): // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  Promise<void | NavigationFailure | false> | false | void | RouteLocationRaw {
    return navigateTo(
      `/workspace/${globalStore.activeWorkspace?.slug}/snippet/${props.snippet.slug}`,
    )
  }
</script>

<style>
  .card-preview .cm-scroller {
    overflow: hidden;
  }
</style>
