<template>
  <ClientOnly>
    <UModal>
      <template #content>
        <EditContent
          scope="snippet"
          :data="props.snippet"
          :state="state"
          :schema="schema"
          :update-callback="updateSnippet"
        />
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
        isPublic: snippet.isPublic,
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
