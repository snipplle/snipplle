<template>
  <ClientOnly>
    <UCard
      :ui="{
        body: 'p-0 sm:p-0',
      }"
      class="group cursor-pointer"
      @click="openSnippet"
    >
      <div class="w-full p-1">
        <CodeViewer
          v-if="snippet.preview"
          :content="code"
          :extensions="extensions"
        />

        <div
          v-else
          class="min-h-40 bg-[#1f1f27] flex items-center justify-center"
        >
          <UIcon
            name="i-hugeicons-document-code"
            class="text-[54px] text-neutral-600"
          />
        </div>
      </div>

      <div class="text-sm p-2.5 space-y-3">
        <div class="flex items-center justify-between">
          <h1 class="font-semibold">{{ snippet.name }}</h1>

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
            <p class="text-xs">{{ snippet.downloads }}</p>
            <UIcon name="i-hugeicons-download-01" class="text-lg" />
          </div>
        </div>
      </div>
    </UCard>
  </ClientOnly>
</template>

<script setup lang="ts">
  import type { NavigationFailure, RouteLocationRaw } from 'vue-router'
  import { catppuccinMocha } from '@catppuccin/codemirror'

  import { LazySnippetPreview } from '#components'

  const props = defineProps<{
    snippet: any
    onDeleteRefresh: () => void
  }>()

  const globalStore = useGlobalStore()
  const overlay = useOverlay()
  const toast = useToast()

  const modal = overlay.create(LazySnippetPreview)

  const extensions = [
    catppuccinMocha,
    languages[props.snippet.language || 'js'],
  ]
  const code = ref()

  const options = ref([
    {
      label: 'Download',
      value: 'download',
      icon: 'i-hugeicons-download-01',
      onClick: (): void => {
        modal.open({
          snippet: props.snippet,
        })
      },
    },
    {
      label: 'Delete',
      value: 'delete',
      icon: 'i-hugeicons-delete-01',
      color: 'red' as any,
      onClick: (): Promise<void> => deleteSnippet(),
    },
  ])

  watch(
    () => props.snippet.preview,
    (newValue) => {
      if (!newValue) {
        return
      }

      code.value = newValue
    },
    {
      immediate: true,
    },
  )

  const tags = computed(() => {
    const tagList = []

    for (const tag of props.snippet.snippet_tags) {
      tagList.push(tag.tags)
    }

    return tagList
  })

  function openSnippet(): // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  Promise<void | NavigationFailure | false> | false | void | RouteLocationRaw {
    return navigateTo(
      `/workspace/${globalStore.activeWorkspace?.slug}/snippet/${props.snippet.slug}`,
    )
  }

  async function deleteSnippet(): Promise<void> {
    try {
      await $fetch(`/api/snippet/${props.snippet.id}`, {
        method: 'DELETE' as any,
      })

      toast.add({
        title: 'Success',
        description: 'Snippet deleted successfully',
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
