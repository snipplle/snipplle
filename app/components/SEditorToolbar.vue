<template>
  <ClientOnly>
    <UDashboardToolbar>
      <div class="w-full flex justify-between">
        <USelectMenu
          v-if="versions.length"
          v-model="selectedVersion"
          :items="versions"
          color="neutral"
          variant="subtle"
          size="sm"
          class="min-w-32"
        />

        <div v-else></div>

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
  }>()

  const { call } = useToolbarEvent()

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
