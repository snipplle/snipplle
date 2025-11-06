<template>
  <ClientOnly>
    <UModal>
      <template #content>
        <div class="p-1">
          <DownloadSnippet :snippet="snippet" />
        </div>
      </template>
    </UModal>
  </ClientOnly>
</template>

<script setup lang="ts">
  defineProps<{
    snippet: any
  }>()
</script>
