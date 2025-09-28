<template>
  <ClientOnly>
    <UCard
      :ui="{
        body: 'sm:p-0'
      }"
      class="group cursor-pointer"
      @click="openSnippet"
    >
      <div class="w-full p-0 rounded-md">
        <SandpackProvider
          :theme="{
            colors: {
              surface1: '#1f1f27'
            }
          }"
          class="!rounded-t-md !rounded-b-none"
        >
          <SandpackLayout class="max-h-32 text-xs !border-none !rounded-t-md !rounded-b-none">
            <SandpackCodeViewer :code="code" class="rounded-t-md rounded-b-none" />
          </SandpackLayout>
        </SandpackProvider>
      </div>

      <div class="text-sm p-2.5 space-y-3">
        <div class="flex items-center justify-between">
          <h1 class="font-semibold">{{ snippet.name }}</h1>

          <SnippetPreview :code="code" name="Snippet name" />
        </div>
        
        <div class="flex items-center justify-between">
          <div class="space-x-1">
            <UBadge
              v-for="tag in tags"
              :key="tag.id"
              :color="tag.color"
              variant="subtle"
              size="sm"
            >{{ tag.name }}</UBadge>
          </div>

          <div class="flex items-center space-x-1">
            <p class="text-xs">43</p>
            <UIcon name="i-hugeicons-download-01" class="text-lg" />
          </div>
        </div>
      </div>
    </UCard>
  </ClientOnly>
</template>

<script setup lang="ts">
  import {
    SandpackProvider,
    SandpackLayout,
    SandpackCodeViewer
  } from 'sandpack-vue3'

  const props = defineProps<{
    snippet: any
  }>()

  const globalStore = useGlobalStore()

  const code = 'const users: { id: number; name: string }[] = [\n  { id: 1, name: "Alice" },\n  { id: 2, name: "Bob" },\n  { id: 3, name: "Charlie" },\n]\n\nfunction findUser(id: number) {\n  return users.find(u => u.id === id) ?? { id, name: "Unknown" }\n}\n\nconsole.log(findUser(2))'

  const tags = computed(() => {
    const tagList = []

    for (const tag of props.snippet.snippet_tags) {
      tagList.push(tag.tags)
    }
    
    return tagList
  })
  
  function openSnippet() {
    return navigateTo(`/workspace/${globalStore.activeWorkspace?.slug}/snippet/${props.snippet.slug}`)
  }
</script>