<template>
  <ClientOnly>
    <UModal>
      <template #content>
        <div class="p-1">
          <div class="p-4 space-y-5">
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
                <UInput v-model="state.name" variant="subtle" class="w-full" />
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

  const state = ref({
    name: '',
    description: '',
    isPublic: false,
  })

  watch(
    () => props.snippet,
    (snippet) => {
      state.value = {
        name: snippet.name,
        description: snippet.description,
        isPublic: snippet.is_public,
      }
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
      await $fetch(`/api/snippet/${props.snippet.id}/edit`, {
        method: 'post',
        body: {
          ...event.data,
          isPublic: state.value.isPublic,
        },
      })

      toast.add({
        title: 'Success',
        description: 'Snippet updated successfully',
        color: 'success',
        icon: 'i-hugeicons-checkmark-circle-01',
        duration: 1500,
      })

      emits('close', false)

      await props.refreshCallback()
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
