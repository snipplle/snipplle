<template>
  <ClientOnly>
    <div class="h-full space-y-4">
      <div v-if="snippets?.length" class="grid grid-cols-4 gap-4">
        <SnippetCard
          v-for="snippet in snippets"
          :key="snippet.id"
          :snippet="snippet"
        />
      </div>

      <div
        v-if="!snippets?.length"
        class="h-full flex flex-col items-center justify-center space-y-2"
      >
        <img src="assets/images/Dev.svg" />

        <div class="flex flex-col items-center space-y-4">
          <div class="flex flex-col items-center">
            <h1 class="font-semibold">No snippets found</h1>
            <p class="text-sm text-neutral-400">
              Create a new snippet to get started.
            </p>
          </div>

          <UButton color="primary" variant="subtle">Create snippet</UButton>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'library',
  })

  const { listen } = useToolbarEvent()

  const queryFields = ref({
    orderBy: 'date',
    lang: '',
    tag: '',
  })

  const { data: snippets } = await useFetch('/api/snippet', {
    method: 'get',
    query: queryFields.value,
  })

  listen('toolbar:order-by', (orderBy: Record<string, string>) => {
    queryFields.value.orderBy = orderBy[0] as string
  })

  listen('toolbar:filter-language', (language: Record<string, string>) => {
    queryFields.value.lang = language[0] as string
  })

  listen('toolbar:filter-tag', (tag: Record<string, string>) => {
    queryFields.value.tag = tag[0] as string
  })
</script>
