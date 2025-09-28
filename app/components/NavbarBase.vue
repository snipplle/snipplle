<template>
  <ClientOnly>
    <UDashboardNavbar :title="pageTitle">
      <template #right>
        <component
          :is="resolveActionButtonComponent(pageTitle)"
          v-if="isGeneralPath"
        />
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
    const pathList = route.fullPath.split('/')

    return capitalize(pathList[pathList.length - 1] as string)
  })

  const isGeneralPath = computed(() => {
    if (route.fullPath.split('/').length > 4) {
      return false
    }

    return true
  })
</script>
