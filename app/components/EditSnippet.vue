<template>
  <ClientOnly>
    <UModal>
      <template #content>
        <div class="p-1">
          <UTabs :items="items" variant="link">
            <template #content="{ item }">
              <div v-if="item.value === 'general'" class="p-4 space-y-5">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <p class="text-sm">ID:</p>
                    <p class="text-neutral-400 font-medium text-xs">
                      {{ snippet.id }}
                    </p>
                  </div>
                  <div class="flex items-center justify-between">
                    <p class="text-sm">Language:</p>
                    <UBadge
                      :color="language[snippet.language].color"
                      variant="subtle"
                      size="sm"
                    >
                      {{ language[snippet.language].label }}
                    </UBadge>
                  </div>
                  <div class="flex items-center justify-between">
                    <p class="text-sm">Downloads:</p>

                    <div
                      class="flex items-center space-x-1 text-neutral-400 text-xs"
                    >
                      <p class="font-medium">{{ snippet.downloads }}</p>
                      <UIcon name="i-hugeicons-download-01" />
                    </div>
                  </div>
                  <div class="flex flex-col">
                    <p class="text-sm">Description:</p>
                    <p class="text-neutral-400 font-medium text-xs">
                      {{ snippet.description }}
                    </p>
                  </div>
                </div>

                <USeparator orientation="horizontal" />

                <UForm
                  :state="state"
                  :schema="schema"
                  class="space-y-4"
                  @submit="updateSnippet"
                >
                  <UFormField label="Name" name="name">
                    <UInput
                      v-model="state.name"
                      variant="subtle"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField label="Description" name="description">
                    <UTextarea
                      v-model="state.description"
                      variant="subtle"
                      class="w-full"
                    />
                  </UFormField>

                  <USwitch
                    v-model="state.isPublic"
                    label="Is snippet public?"
                    description="If checked, the snippet will be visible to all users."
                    :ui="{
                      root: 'justify-between items-center flex-row-reverse',
                      wrapper: 'ms-0',
                    }"
                  />

                  <div class="flex justify-end">
                    <UButton type="submit">Update Snippet</UButton>
                  </div>
                </UForm>
              </div>

              <div v-if="item.value === 'preview'" class="p-2 space-y-5">
                <UFormField label="Preview Mode">
                  <UTabs
                    :items="previewModes"
                    :default-value="previewMode"
                    :content="false"
                    @update:model-value="previewMode = $event as string"
                  />

                  <template #help>
                    <p class="text-neutral-400 font-medium text-xs">
                      Preview mode determines how the snippet will be displayed
                      in the editor.
                      <span class="font-bold italic"
                        >(Only for another users)</span
                      >
                    </p>

                    <ul class="text-xs text-neutral-500">
                      <li>None: No preview will be displayed. Only editor</li>
                      <li>
                        Console: Preview will be displayed in the console.
                        Editor and console
                      </li>
                      <li>
                        Full Preview: Preview will be displayed in the separate
                        preview tab. Editor, console and preview tab.
                      </li>
                    </ul>
                  </template>
                </UFormField>

                <div class="flex justify-end">
                  <UButton @click="updatePreviewMode"
                    >Update preview mode</UButton
                  >
                </div>
              </div>
            </template>
          </UTabs>
        </div>
      </template>
    </UModal>
  </ClientOnly>
</template>

<script setup lang="ts">
  import * as z from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'

  const props = defineProps<{
    snippet: any
    refreshCallback: () => void
  }>()

  const emits = defineEmits(['close'])

  const toast = useToast()

  const items = ref([
    {
      label: 'General',
      value: 'general',
    },
    {
      label: 'Preview',
      value: 'preview',
    },
  ])
  const previewModes = ref([
    {
      label: 'None',
      value: 'none',
    },
    {
      label: 'Console',
      value: 'console',
    },
    {
      label: 'Full Preview',
      value: 'full',
    },
  ])

  const state = ref({
    name: '',
    description: '',
    isPublic: false,
  })
  const previewMode = ref<string | undefined>(previewModes.value[0]?.value)

  watch(
    () => props.snippet,
    (snippet) => {
      state.value = {
        name: snippet.name,
        description: snippet.description,
        isPublic: snippet.is_public,
      }

      previewMode.value = snippet.preview_mode
    },
    {
      immediate: true,
    },
  )

  const schema = z.object({
    name: z
      .string('Snippet name is required')
      .min(1, 'Snippet name must be at least 1 character long')
      .max(100, 'Snippet name must be at most 100 characters long'),
    description: z.string().optional(),
  })

  type Schema = z.output<typeof schema>

  async function updateSnippet(event: FormSubmitEvent<Schema>): Promise<void> {
    try {
      const response = await $fetch(`/api/snippet/${props.snippet.id}/edit`, {
        method: 'post',
        body: event.data,
      })

      toast.add({
        title: 'Success',
        description: 'Snippet updated successfully',
        color: 'success',
        icon: 'i-hugeicons-checkmark-circle-01',
      })

      emits('close', false)

      await props.refreshCallback()
    } catch (error: any) {
      toast.add({
        title: 'Oops',
        description: error.statusMessage,
        color: 'error',
        icon: 'i-hugeicons-exclamation-circle-01',
      })
    }
  }

  async function updatePreviewMode(): Promise<void> {
    console.log(previewMode.value)
  }
</script>
