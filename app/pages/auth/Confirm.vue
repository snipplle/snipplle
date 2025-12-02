<template>
  <ClientOnly>
    <div></div>
  </ClientOnly>
</template>

<script setup lang="ts">
  const { authClient } = useAuthClient()
  const globalStore = useGlobalStore()

  const { data } = await authClient.getSession()

  watch(
    () => data?.user,
    async () => {
      if (data) {
        if (!data.user.onboardingCompleted) {
          return navigateTo('/welcome')
        }

        const response = await $fetch('/api/workspace/default', {
          method: 'GET',
        })

        if (!response) {
          return navigateTo('/welcome')
        }

        globalStore.setActiveWorkspace({
          id: response.id,
          slug: response.slug,
        })

        return navigateTo(`/workspace/${response.slug}/snippets`)
      }

      return navigateTo('/auth/sign-in')
    },
    { immediate: true },
  )
</script>
