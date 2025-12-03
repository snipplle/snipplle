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
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
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
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <LibraryCard
            is="collection"
            v-for="collection in collections"
            :key="collection.id"
            :data="collection"
          />
        </div>

        <div
          v-else
          class="h-full flex flex-col items-center justify-center space-y-2"
        >
          <img
            v-if="selectedCategory === 'snippets'"
            src="assets/images/Dev.svg"
          />

          <img
            v-else-if="selectedCategory === 'collections'"
            src="assets/images/Pack.svg"
          />

          <div class="flex flex-col items-center space-y-4">
            <div class="flex flex-col items-center">
              <h1 class="font-semibold">No {{ selectedCategory }} found</h1>
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <UPagination
            v-if="
              (selectedCategory === 'snippets' && snippets?.length) ||
              (selectedCategory === 'collections' && collections?.length)
            "
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

  const { listen } = useToolbarEvent()

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

  listen('toolbar:order-by', (orderBy: Record<string, string>) => {
    queryFields.value.orderBy = orderBy[0] as string
  })

  listen('toolbar:filter-language', (language: Record<string, string>) => {
    queryFields.value.lang = language[0] as string
  })

  listen('toolbar:filter-tag', (tag: Record<string, string>) => {
    queryFields.value.tag = tag[0] as string
  })

  listen('toolbar:search', (search: Record<string, string>) => {
    queryFields.value.search = search[0] as string
  })
</script>
