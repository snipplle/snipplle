<template>
  <ClientOnly>
    <UCard
      :ui="{
        body: 'p-0 sm:p-0',
      }"
      class="group cursor-pointer"
      @click="openSnippet"
    >
      <div class="w-full p-0 rounded-md">
        <CodeViewer
          v-if="data.preview && is === 'snippet'"
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
          <h1 class="font-semibold">{{ data.name }}</h1>

          <div v-if="is === 'snippet'" class="flex items-center space-x-1">
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
            <p class="text-xs">{{ data.downloads }}</p>
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
    data: any
    is: 'snippet' | 'collection'
  }>()

  const globalStore = useGlobalStore()
  const overlay = useOverlay()

  const modal = overlay.create(LazySnippetPreview)

  const extensions = [catppuccinMocha, languages[props.data.language || 'js']]
  const code = ref()

  const options = computed(() => {
    return props.is === 'snippet'
      ? [
          {
            label: 'Download',
            value: 'download',
            icon: 'i-hugeicons-download-01',
            onClick: (): void => {
              modal.open({
                snippet: props.data,
              })
            },
          },
        ]
      : []
  })

  watch(
    () => props.data.preview,
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

    for (const tag of props.data.collection_tags || props.data.snippet_tags) {
      tagList.push(tag.tags)
    }

    return tagList
  })

  function openSnippet(): // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  Promise<void | NavigationFailure | false> | false | void | RouteLocationRaw {
    const route = `/preview/${globalStore.activeWorkspace?.slug}/${props.is}/${props.data.slug}`

    globalStore.setPreviewWorkspaceId(globalStore.activeWorkspace?.id || '')

    return navigateTo(route)
  }
</script>
