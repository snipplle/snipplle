<template>
  <ClientOnly>
    <UDashboardNavbar :title="pageTitle">
      <template #right>
        <UButton>Create Snippet</UButton>
      </template>
    </UDashboardNavbar>
  </ClientOnly>
</template>

<script setup lang="ts">
  import { capitalize } from 'vue'

  const route = useRoute()

  const pageTitle = computed(() => {
    return capitalize(route.fullPath.split('/')[3] as string)
  })
</script>