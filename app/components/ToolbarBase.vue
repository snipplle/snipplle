<template>
  <ClientOnly>
    <UDashboardToolbar v-if="showToolbar">
      <div class="w-full flex justify-between">
        <USelectMenu
          v-model="selectedVersion"
          :items="items"
          color="neutral"
          variant="subtle"
          size="sm"
          class="min-w-32"
        />

        <div class="space-x-1">
          <UButton
            icon="i-hugeicons-view"
            color="warning"
            variant="subtle"
            size="sm"
          >
            Preview
          </UButton>
          <UButton
            icon="i-hugeicons-edit-01"
            color="secondary"
            variant="subtle"
            size="sm"
          >
            Edit
          </UButton>
          <UButton
            icon="i-hugeicons-floppy-disk"
            color="primary"
            variant="subtle"
            size="sm"
          >
            Save
          </UButton>
        </div>
      </div>
    </UDashboardToolbar>
  </ClientOnly>
</template>

<script setup lang="ts">
  defineProps<{
    showToolbar?: boolean
  }>()

  const items = ref([
    {
      label: 'latest',
      value: 'v-latest',
    },
    {
      label: 'v1.0.0',
      value: 'v1.0.0',
    },
  ])
  const selectedVersion = ref(items.value[0])
</script>
