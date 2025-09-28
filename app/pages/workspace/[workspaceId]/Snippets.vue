<template>
  <ClientOnly>
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="space-x-1">
          <UButton
            icon="i-hugeicons-filter"
            color="neutral"
            variant="subtle"
            size="sm"
          >
            Filter
          </UButton>
          <UButton
            icon="i-hugeicons-unfold-more"
            color="neutral"
            variant="subtle"
            size="sm"
          >
            Order by
          </UButton>
        </div>

        <UInput
          icon="i-hugeicons-search-01"
          variant="subtle"
          size="sm"
          placeholder="Search..."
        />
      </div>
      
      <div class="grid grid-cols-4 gap-4">
        <SnippetCard
          v-for="snippet in snippets"
          :key="snippet.id"
          :snippet="snippet"
        />
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'workspace'
  })

  const { data: snippets } = await useFetch('/api/snippet', {
    method: 'get',
  })
</script>