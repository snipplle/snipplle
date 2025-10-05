<template>
  <ClientOnly>
    <NuxtLayout name="editor" :title="collection?.name">
      <div class="flex h-full space-x-2">
        <div class="flex flex-col w-full space-y-2">
          <div
            class="bg-default border border-light-gray-800 w-full h-full p-2 rounded-lg space-y-2"
          >
            <div
              v-for="i in 4"
              :key="i"
              class="bg-light-gray-800 border border-light-gray-700 p-4 rounded-md"
            >
              {{ i }}
            </div>
          </div>
          <div
            class="bg-default border border-light-gray-800 w-full h-full p-2 rounded-lg space-y-2"
          >
            <div
              v-for="i in 2"
              :key="i"
              class="bg-light-gray-800 border border-light-gray-700 p-4 rounded-md"
            >
              {{ i }}
            </div>
          </div>
        </div>

        <div
          class="bg-default border border-light-gray-800 w-full h-full rounded-lg"
        ></div>
      </div>
    </NuxtLayout>
  </ClientOnly>
</template>

<script setup lang="ts">
  const { params } = useRoute()
  const globalStore = useGlobalStore()
  const { listen } = useToolbarEvent()

  const { data: collection, refresh } = await useFetch<any>(
    `/api/collection/${params.collectionId}`,
    {
      method: 'get',
      query: {
        workspaceId: globalStore.activeWorkspace?.id,
      },
    },
  )
</script>
