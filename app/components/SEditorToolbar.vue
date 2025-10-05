<template>
  <ClientOnly>
    <UDashboardToolbar>
      <div class="w-full flex justify-between">
        <div class="space-x-1">
          <USelectMenu
            v-if="versions.length"
            v-model="selectedVersion"
            :items="versions"
            color="neutral"
            variant="subtle"
            size="sm"
            class="min-w-32"
          />

          <USelectMenu
            v-model="selectedLanguage"
            :items="languages"
            color="neutral"
            variant="subtle"
            size="sm"
            class="min-w-32"
          />
        </div>

        <div class="space-x-1">
          <UDropdownMenu :items="previewModes">
            <UButton
              icon="i-hugeicons-view"
              color="warning"
              variant="subtle"
              size="sm"
            >
              Preview
            </UButton>
          </UDropdownMenu>

          <UButton
            icon="i-hugeicons-edit-01"
            color="secondary"
            variant="subtle"
            size="sm"
            @click="call('toolbar:edit')"
          >
            Edit
          </UButton>
          <UButton
            icon="i-hugeicons-floppy-disk"
            color="primary"
            variant="subtle"
            size="sm"
            @click="call('toolbar:save')"
          >
            Save
          </UButton>
        </div>
      </div>
    </UDashboardToolbar>
  </ClientOnly>
</template>

<script setup lang="ts">
  const props = defineProps<{
    versions: any[]
    language: string
  }>()

  const { call } = useToolbarEvent()

  const languages = ref([
    {
      label: 'JavaScript',
      value: 'js',
      onSelect: (): void => call('toolbar:change-language', 'js'),
    },
    {
      label: 'TypeScript',
      value: 'ts',
      onSelect: (): void => call('toolbar:change-language', 'ts'),
    },
    {
      label: 'HTML',
      value: 'html',
      onSelect: (): void => call('toolbar:change-language', 'html'),
    },
    {
      label: 'CSS',
      value: 'css',
      onSelect: (): void => call('toolbar:change-language', 'css'),
    },
    {
      label: 'JSON',
      value: 'json',
      onSelect: (): void => call('toolbar:change-language', 'json'),
    },
    {
      label: 'Markdown',
      value: 'md',
      onSelect: (): void => call('toolbar:change-language', 'md'),
    },
    {
      label: 'XML',
      value: 'xml',
      onSelect: (): void => call('toolbar:change-language', 'xml'),
    },
    {
      label: 'YAML',
      value: 'yaml',
      onSelect: (): void => call('toolbar:change-language', 'yaml'),
    },
    {
      label: 'SQL',
      value: 'sql',
      onSelect: (): void => call('toolbar:change-language', 'sql'),
    },
    {
      label: 'PHP',
      value: 'php',
      onSelect: (): void => call('toolbar:change-language', 'php'),
    },
    {
      label: 'Python',
      value: 'py',
      onSelect: (): void => call('toolbar:change-language', 'py'),
    },
    {
      label: 'Go',
      value: 'go',
      onSelect: (): void => call('toolbar:change-language', 'go'),
    },
    {
      label: 'Rust',
      value: 'rust',
      onSelect: (): void => call('toolbar:change-language', 'rust'),
    },
    {
      label: 'Java',
      value: 'java',
      onSelect: (): void => call('toolbar:change-language', 'java'),
    },
  ])
  const selectedLanguage = ref()

  watch(
    () => props.language,
    (newLanguage) => {
      selectedLanguage.value =
        languages.value.find((language) => language.value === newLanguage) ||
        languages.value[0]
    },
    { immediate: true },
  )

  const previewModes = ref([
    {
      label: 'None',
      value: 'none',
      icon: 'i-hugeicons-unavailable',
      onClick: (): void => call('toolbar:preview', 'none'),
    },
    {
      label: 'Console',
      value: 'console',
      icon: 'i-hugeicons-computer-terminal-01',
      onClick: (): void => call('toolbar:preview', 'console'),
    },
    {
      label: 'Full preview',
      value: 'full',
      icon: 'i-hugeicons-layout-03',
      onClick: (): void => call('toolbar:preview', 'full'),
    },
  ])

  const versions = computed(() => {
    if (!props.versions) {
      return []
    }

    const versionList = props.versions.map((version) => ({
      label: version.is_latest ? 'latest' : `Version ${version.version}`,
      value: version.id,
      is_latest: version.is_latest,
    }))

    return versionList.sort((a, b) => b.is_latest - a.is_latest)
  })

  const selectedVersion = ref(
    versions.value.find((version) => version.is_latest),
  )

  watch(selectedVersion, (newVersion) => {
    call('toolbar:change-version', newVersion?.value)
  })
</script>
