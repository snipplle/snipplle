<template>
  <div/>
</template>

<script setup lang="ts">
  const user = useSupabaseUser()
  const globalStore = useGlobalStore()

  watch(user, async () => {
    if (user.value) {
      if (!user.value.user_metadata?.onboarding_completed) {
        return navigateTo('/welcome')
      }

      const response = await $fetch('/api/workspace/default', {
        method: 'GET'
      })

      globalStore.setActiveWorkspace({
        id: response.id,
        slug: response.slug
      })

      return navigateTo(`/workspace/${response.slug}/snippets`)
    }

    return navigateTo('/auth/signin')
  }, { immediate: true })
</script>