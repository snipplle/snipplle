<template>
  <ClientOnly>
    <NuxtLayout name="preview" :title="data.name">
      <div class="h-full">
        <!-- <Codemirror
          v-model="snippetCode"
          class="editor"
          :style="{
            height: '100%',
            padding: '12px',
            border: '1px solid #24273a',
          }"
          :extensions="extensions"
        /> -->
      </div>
    </NuxtLayout>
  </ClientOnly>
</template>

<script setup lang="ts">
  const { params } = useRoute()
  const globalStore = useGlobalStore()

  const { data } = await useFetch(
    `/api/snippet/${params.snippetId}?workspaceId=${globalStore.previewWorkspaceId}`,
    {
      method: 'GET',
    },
  )
</script>
