<template>
  <ClientOnly>
    <div class="flex justify-between">
      <p class="text-sm text-neutral-400">
        {{ selectedCategory === 'snippets' ? snippetsTotal : collectionsTotal }}
        {{ selectedCategory === 'snippets' ? 'Snippets' : 'Collections' }}
      </p>

      <UTabs
        v-model="selectedCategory"
        :items="category"
        size="xs"
        :content="false"
      />
    </div>

    <div class="h-full space-y-4">
      <div class="w-full h-full flex flex-col justify-between">
        <div
          v-if="selectedCategory === 'snippets' && snippets?.length"
          class="grid grid-cols-4 gap-4"
        >
          <LibraryCard
            is="snippet"
            v-for="snippet in snippets"
            :key="snippet.id"
            :data="snippet"
          />
        </div>

        <div
          v-else-if="selectedCategory === 'collections' && collections?.length"
          class="grid grid-cols-4 gap-4"
        >
          <LibraryCard
            is="collection"
            v-for="collection in collections"
            :key="collection.id"
            :data="collection"
          />
        </div>

        <div class="flex justify-center">
          <UPagination
            v-model:page="queryFields.page"
            :items-per-page="queryFields.itemsPerPage"
            :total="
              selectedCategory === 'snippets' ? snippetsTotal : collectionsTotal
            "
            color="neutral"
            variant="subtle"
            active-variant="subtle"
            size="sm"
            @update:page="(page) => (queryFields.page = page)"
          />
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'library',
  })

  const category = ref([
    {
      icon: 'i-hugeicons-document-code',
      value: 'snippets',
    },
    {
      icon: 'i-hugeicons-code-folder',
      value: 'collections',
    },
  ])
  const selectedCategory = ref(category.value[0]?.value)
  const queryFields = ref({
    orderBy: 'date',
    lang: '',
    tag: '',
    search: '',
    page: 1,
    itemsPerPage: 8,
  })

  const { data: snippetsData } = await useFetch('/api/snippet/library', {
    method: 'GET',
    query: queryFields.value,
  })

  const { data: collectionsData } = await useFetch('/api/collection/library', {
    method: 'GET',
    query: queryFields.value,
  })

  const snippets = computed(() => (snippetsData.value?.snippets as any) || [])
  const snippetsTotal = computed(() => snippetsData.value?.count || 0)

  const collections = computed(
    () => (collectionsData.value?.collections as any) || [],
  )
  const collectionsTotal = computed(() => collectionsData.value?.count || 0)
</script>
