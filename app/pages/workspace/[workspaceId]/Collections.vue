<template>
  <ClientOnly>
    <div class="h-full space-y-4">
      <div
        v-if="collections?.length"
        class="w-full h-full flex flex-col justify-between"
      >
        <div class="grid grid-cols-4 gap-4">
          <CollectionCard
            v-for="collection in collections"
            :key="collection.id"
            :collection="collection"
          />
        </div>

        <div class="flex justify-center">
          <!-- <UPagination
            v-model:page="queryFields.page"
            :items-per-page="queryFields.itemsPerPage"
            :total="total"
            color="neutral"
            variant="subtle"
            active-variant="subtle"
            size="sm"
            @update:page="(page) => (queryFields.page = page)"
          /> -->
        </div>
      </div>

      <div
        v-if="!collections?.length"
        class="h-full flex flex-col items-center justify-center space-y-2"
      >
        <img src="assets/images/Pack.svg" />

        <div class="flex flex-col items-center space-y-4">
          <div class="flex flex-col items-center">
            <h1 class="font-semibold">No collections found</h1>
            <p class="text-sm text-neutral-400">
              Create a new collection to get started.
            </p>
          </div>

          <CreateCollection variant="subtle" />
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'library',
  })

  const { data: collections } = await useFetch('/api/collection', {
    method: 'get',
  })
</script>
