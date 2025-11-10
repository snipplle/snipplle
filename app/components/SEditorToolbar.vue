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
            v-if="hasAccess"
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
  const props = withDefaults(
    defineProps<{
      versions?: any[]
      hasAccess?: boolean
    }>(),
    {
      versions: undefined,
      hasAccess: true,
    },
  )

  const { call } = useToolbarEvent()

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

  watch(versions, (newVersions) => {
    selectedVersion.value = newVersions.find((version) => version.is_latest)
  })

  watch(selectedVersion, (newVersion) => {
    call('toolbar:change-version', newVersion?.value)
  })
</script>
