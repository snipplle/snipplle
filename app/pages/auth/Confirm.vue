<template>
  <div/>
</template>

<script setup lang="ts">
  const user = useSupabaseUser()

  watch(user, () => {
    if (user.value) {
      if (!user.value.user_metadata?.onboardingCompleted) {
        return navigateTo('/welcome')
      }

      return navigateTo('/workspace/test/snippets')
    }

    return navigateTo('/auth/signin')
  }, { immediate: true })
</script>