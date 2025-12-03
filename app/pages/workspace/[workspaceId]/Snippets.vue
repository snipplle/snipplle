<template>
  <ClientOnly>
    <NuxtLayout name="library" :has-access="hasAccess">
      <div class="h-full space-y-4">
        <div
          v-if="snippets?.length"
          class="w-full h-full flex flex-col justify-between"
        >
          <div
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <SnippetCard
              v-for="snippet in snippets"
              :key="snippet.id"
              :snippet="snippet"
              :on-delete-refresh="refreshAll"
            />
          </div>

          <div class="flex justify-center">
            <UPagination
              v-model:page="queryFields.page"
              :items-per-page="queryFields.itemsPerPage"
              :total="total"
              color="neutral"
              variant="subtle"
              active-variant="subtle"
              size="sm"
              @update:page="(page) => (queryFields.page = page)"
            />
          </div>
        </div>

        <div
          v-else
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

            <CreateSnippet v-if="hasAccess" variant="subtle" />
          </div>
        </div>
      </div>
    </NuxtLayout>
  </ClientOnly>
</template>

<script setup lang="ts">
  const { listen } = useToolbarEvent()
  const { hasAccess, refresh: refreshPermission } =
    await usePermission('public_snippets')

  const queryFields = ref({
    orderBy: 'date',
    lang: '',
    tag: '',
    search: '',
    page: 1,
    itemsPerPage: 8,
  })

  const { data, refresh } = await useFetch('/api/snippet', {
    method: 'get',
    query: queryFields.value,
  })

  const snippets = computed(() => data.value?.snippets || [])
  const total = computed(() => data.value?.count || 0)

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

  function refreshAll(): void {
    refreshPermission()
    refresh()
  }
</script>
