<template>
  <ClientOnly>
    <UDashboardNavbar :title="pageTitle">
      <template #right>
        <component :is="resolveActionButtonComponent(pageTitle)" />
      </template>
    </UDashboardNavbar>
  </ClientOnly>
</template>

<script setup lang="ts">
  import { capitalize, type Component } from 'vue'

  const route = useRoute()

  const modals = ref<Record<string, any>>({
    snippets: import('./CreateSnippet.vue'),
  })

  function resolveActionButtonComponent(action: string): Component {
    return defineAsyncComponent(() => modals.value[action.toLowerCase()])
  }

  const pageTitle = computed(() => {
    return capitalize(route.fullPath.split('/')[3] as string)
  })
</script>
