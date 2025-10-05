<template>
  <ClientOnly>
    <NuxtLayout name="workspace">
      <div></div>
    </NuxtLayout>
  </ClientOnly>
</template>

<script setup lang="ts">
  const { params } = useRoute()
  const { listen } = useToolbarEvent()

  // const { data: snippet, refresh } = await useFetch<any>(
  //   `/api/snippet/${params.snippetId}?workspaceId=${globalStore.activeWorkspace?.id}`,
  //   {
  //     method: 'get',
  //   },
  // )
</script>
