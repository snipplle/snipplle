<template>
  <ClientOnly>
    <UDashboardNavbar :title="pageTitle">
      <template #leading>
        <UButton
          v-if="!isGeneralPath"
          icon="i-hugeicons-arrow-left-01"
          color="neutral"
          variant="link"
          @click="goBack"
        />
      </template>

      <template #right>
        <component
          :is="resolveActionButtonComponent"
          v-if="isGeneralPath && hasActionButton && hasAccess"
        />
      </template>
    </UDashboardNavbar>
  </ClientOnly>
</template>

<script setup lang="ts">
  import { capitalize } from 'vue'

  const props = withDefaults(
    defineProps<{
      title?: string
      hasAccess?: boolean
    }>(),
    {
      title: '',
      hasAccess: true,
    },
  )

  const route = useRoute()
  const router = useRouter()

  const modals = ref<Record<string, any>>({
    snippets: import('./snippets/CreateSnippet.vue'),
    collections: import('./collections/CreateCollection.vue'),
  })

  const pageTitle = computed(() => {
    const pathList = route.fullPath.split('/')

    return props.title || capitalize(pathList[pathList.length - 1] as string)
  })

  const hasActionButton = computed(() => {
    return actionButtons.includes(pageTitle.value.toLowerCase())
  })

  const resolveActionButtonComponent = computed(() => {
    return defineAsyncComponent(
      () => modals.value[pageTitle.value.toLowerCase()],
    )
  })

  const isGeneralPath = computed(() => {
    if (route.fullPath.split('/').length > 4) {
      return false
    }

    return true
  })

  async function goBack(): Promise<void> {
    await router.back()
  }
</script>
