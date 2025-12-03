<template>
  <ClientOnly>
    <UCard
      :ui="{
        body: 'p-0 sm:p-0',
      }"
      class="group cursor-pointer"
      @click="openCollection"
    >
      <div class="w-full p-[3px]">
        <div
          class="min-h-40 bg-neutral-800 flex items-center justify-center rounded-[10px]"
        >
          <UIcon
            name="i-hugeicons-code-folder"
            class="text-7xl text-neutral-600"
          />
        </div>
      </div>

      <div class="text-sm p-2.5 space-y-3">
        <div class="flex items-center justify-between">
          <h1 class="font-semibold">{{ collection.name }}</h1>

          <div class="flex items-center space-x-1">
            <UDropdownMenu :items="options">
              <UButton
                icon="i-hugeicons-more-horizontal"
                color="neutral"
                variant="link"
                size="sm"
                class="p-0"
                @click.stop
              />
            </UDropdownMenu>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-1">
            <UBadge
              v-for="tag in tags.slice(0, 3)"
              :key="tag.id"
              :color="tag.color"
              variant="subtle"
              size="sm"
            >
              {{ tag.name }}
            </UBadge>

            <UPopover v-if="tags.length > 3" mode="hover">
              <UIcon
                name="i-hugeicons-plus-sign-circle"
                class="text-neutral-400"
              />

              <template #content>
                <div class="flex p-1 space-x-1">
                  <UBadge
                    v-for="tag in tags"
                    :key="tag.id"
                    :color="tag.color"
                    variant="subtle"
                    size="sm"
                  >
                    {{ tag.name }}
                  </UBadge>
                </div>
              </template>
            </UPopover>
          </div>

          <div class="flex items-center space-x-1">
            <p class="text-xs">{{ collection.downloads }}</p>
            <UIcon name="i-hugeicons-download-01" class="text-lg" />
          </div>
        </div>
      </div>
    </UCard>
  </ClientOnly>
</template>

<script setup lang="ts">
  import type { NavigationFailure, RouteLocationRaw } from 'vue-router'

  const props = defineProps<{
    collection: any
    onDeleteRefresh: () => void
  }>()

  const globalStore = useGlobalStore()
  const toast = useToast()

  const options = ref([
    {
      label: 'Delete',
      value: 'delete',
      icon: 'i-hugeicons-delete-01',
      color: 'red' as any,
      onClick: (): Promise<void> => deleteCollection(),
    },
  ])

  const tags = computed(() => {
    const tagList = []

    for (const tag of props.collection.collectionTags) {
      tagList.push(tag.tag)
    }

    return tagList
  })

  function openCollection(): // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  Promise<void | NavigationFailure | false> | false | void | RouteLocationRaw {
    globalStore.setSelectedJoinedWorkspace(undefined)

    const activeWorkspace = globalStore.activeWorkspace
    const collectionWorkspace = props.collection.workspaceId

    if (activeWorkspace?.id !== collectionWorkspace) {
      globalStore.setSelectedJoinedWorkspace({
        id: collectionWorkspace,
        slug: props.collection.workspace.slug,
      })

      return navigateTo(
        `/workspace/${props.collection.workspace.slug}/collection/${props.collection.slug}`,
      )
    }

    return navigateTo(
      `/workspace/${globalStore.activeWorkspace?.slug}/collection/${props.collection.slug}`,
    )
  }

  async function deleteCollection(): Promise<void> {
    try {
      await $fetch(`/api/collection/${props.collection.id}`, {
        method: 'DELETE' as any,
      })

      toast.add({
        title: 'Success',
        description: 'Collection deleted successfully',
        color: 'success',
        icon: 'i-hugeicons-checkmark-circle-01',
        duration: 1500,
      })

      props.onDeleteRefresh()
    } catch (error: any) {
      toast.add({
        title: 'Oops',
        description: error.statusMessage,
        color: 'error',
        icon: 'i-hugeicons-fire',
        duration: 1500,
      })
    }
  }
</script>
