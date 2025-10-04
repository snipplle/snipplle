<template>
  <ClientOnly>
    <div class="h-full space-y-4">
      <div v-if="collections?.length" class="grid grid-cols-4 gap-4" />

      <div
        v-if="!collections?.length"
        class="h-full flex flex-col items-center justify-center space-y-2"
      >
        <img src="assets/images/Pack.svg" />

        <div class="flex flex-col items-center space-y-4">
          <div class="flex flex-col items-center">
            <h1 class="font-semibold">No collections found</h1>
            <p class="text-sm text-neutral-400">
              Create a new collection to get started.
            </p>
          </div>

          <UButton color="primary" variant="subtle">Create collection</UButton>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'library',
  })

  const { data: collections } = await useFetch('/api/collection', {
    method: 'get',
  })
</script>
