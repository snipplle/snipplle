<template>
  <ClientOnly>
    <UDashboardToolbar>
      <div class="w-full flex items-center justify-between">
        <div class="flex items-center space-x-1">
          <UPopover
            class="min-w-32"
            :content="{
              side: 'bottom',
              align: 'start',
            }"
          >
            <UButton
              icon="i-hugeicons-filter"
              color="neutral"
              variant="subtle"
              size="sm"
            >
              Filter
            </UButton>

            <template #content>
              <div class="flex items-center p-2 space-x-1">
                <USelectMenu
                  v-model="selectedLanguage"
                  :items="languages"
                  variant="subtle"
                  trailing-icon="i-hugeicons-unfold-more"
                  class="min-w-32"
                  placeholder="Select a language"
                />

                <USelectMenu
                  v-model="selectedTag"
                  :items="tagOptions"
                  variant="subtle"
                  trailing-icon="i-hugeicons-unfold-more"
                  class="min-w-32"
                  placeholder="Select a tag"
                />

                <UButton
                  icon="i-hugeicons-filter-reset"
                  color="neutral"
                  variant="subtle"
                  @click="resetFilters"
                />
              </div>
            </template>
          </UPopover>

          <USelect
            v-model="orderByValue"
            :items="orderBy"
            size="sm"
            variant="subtle"
            class="min-w-36"
            trailing-icon="i-hugeicons-unfold-more"
          />
        </div>

        <UInput
          v-model="searchQuery"
          icon="i-hugeicons-search-01"
          variant="subtle"
          size="sm"
          placeholder="Search..."
          :ui="{
            trailing: 'pe-1',
          }"
          @input="call('toolbar:search', $event.target.value)"
        >
          <template v-if="searchQuery.length" #trailing>
            <UButton
              icon="i-hugeicons-cancel-01"
              color="neutral"
              variant="link"
              size="xs"
              @click="resetSearch"
            />
          </template>
        </UInput>
      </div>
    </UDashboardToolbar>
  </ClientOnly>
</template>

<script setup lang="ts">
  const { call } = useToolbarEvent()

  const { data: tags } = await useFetch('/api/snippet/tag')

  const languages = ref([
    {
      label: 'JavaScript',
      value: 'js',
      onSelect: (): void => call('toolbar:filter-language', 'js'),
    },
    {
      label: 'TypeScript',
      value: 'ts',
      onSelect: (): void => call('toolbar:filter-language', 'ts'),
    },
    {
      label: 'HTML',
      value: 'html',
      onSelect: (): void => call('toolbar:filter-language', 'html'),
    },
    {
      label: 'CSS',
      value: 'css',
      onSelect: (): void => call('toolbar:filter-language', 'css'),
    },
    {
      label: 'JSON',
      value: 'json',
      onSelect: (): void => call('toolbar:filter-language', 'json'),
    },
    {
      label: 'Markdown',
      value: 'md',
      onSelect: (): void => call('toolbar:filter-language', 'md'),
    },
    {
      label: 'XML',
      value: 'xml',
      onSelect: (): void => call('toolbar:filter-language', 'xml'),
    },
    {
      label: 'YAML',
      value: 'yaml',
      onSelect: (): void => call('toolbar:filter-language', 'yaml'),
    },
    {
      label: 'SQL',
      value: 'sql',
      onSelect: (): void => call('toolbar:filter-language', 'sql'),
    },
    {
      label: 'PHP',
      value: 'php',
      onSelect: (): void => call('toolbar:filter-language', 'php'),
    },
    {
      label: 'Python',
      value: 'py',
      onSelect: (): void => call('toolbar:filter-language', 'py'),
    },
    {
      label: 'Go',
      value: 'go',
      onSelect: (): void => call('toolbar:filter-language', 'go'),
    },
    {
      label: 'Rust',
      value: 'rust',
      onSelect: (): void => call('toolbar:filter-language', 'rust'),
    },
    {
      label: 'Java',
      value: 'java',
      onSelect: (): void => call('toolbar:filter-language', 'java'),
    },
  ])
  const selectedLanguage = ref()

  const tagOptions = computed(() => {
    return tags.value?.map((tag: any) => ({
      label: tag.name,
      value: tag.name,
      onSelect: (): void => call('toolbar:filter-tag', tag.name),
    }))
  })
  const selectedTag = ref()

  const orderBy = ref([
    {
      label: 'Order by',
      value: 'order-by',
      icon: 'i-hugeicons-arrow-up-down',
      onSelect: (): void => call('toolbar:order-by', 'date'),
    },
    {
      label: 'Date (newest)',
      value: 'date',
      icon: 'i-hugeicons-calendar-03',
      onSelect: (): void => call('toolbar:order-by', 'date'),
    },
    {
      label: 'Date (oldest)',
      value: 'date-reverse',
      icon: 'i-hugeicons-calendar-03',
      onSelect: (): void => call('toolbar:order-by', 'date-reverse'),
    },
    {
      label: 'Name (A-Z)',
      value: 'name',
      icon: 'i-hugeicons-arrange-by-letters-a-z',
      onSelect: (): void => call('toolbar:order-by', 'name'),
    },
    {
      label: 'Name (Z-A)',
      value: 'name-reverse',
      icon: 'i-hugeicons-arrange-by-letters-z-a',
      onSelect: (): void => call('toolbar:order-by', 'name-reverse'),
    },
    {
      label: 'Most downloaded',
      value: 'downloads',
      icon: 'i-hugeicons-download-01',
      onSelect: (): void => call('toolbar:order-by', 'downloads'),
    },
  ])
  const orderByValue = ref(orderBy.value[0]?.value)

  const searchQuery = ref('')

  function resetFilters(): void {
    selectedLanguage.value = undefined
    selectedTag.value = undefined

    call('toolbar:filter-language', undefined)
    call('toolbar:filter-tag', undefined)
  }

  function resetSearch(): void {
    searchQuery.value = ''

    call('toolbar:search', '')
  }
</script>
