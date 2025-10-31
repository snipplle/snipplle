<template>
  <ClientOnly>
    <UModal>
      <template #content>
        <EditContent
          scope="collection"
          :data="props.collection"
          :state="state"
          :schema="schema"
          :update-callback="updateCollection"
        />
      </template>
    </UModal>
  </ClientOnly>
</template>

<script setup lang="ts">
  import * as z from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'

  const props = defineProps<{
    collection: any
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
    () => props.collection,
    (collection) => {
      state.value = {
        name: collection.name,
        description: collection.description,
        isPublic: collection.is_public,
      }
    },
    {
      immediate: true,
    },
  )

  const schema = z.object({
    name: z
      .string('Collection name is required')
      .min(1, 'Collection name must be at least 1 character long')
      .max(100, 'Collection name must be at most 100 characters long'),
    description: z.string().optional(),
  })

  type Schema = z.output<typeof schema>

  async function updateCollection(
    event: FormSubmitEvent<Schema>,
  ): Promise<void> {
    try {
      await $fetch(`/api/collection/${props.collection.id}/edit`, {
        method: 'post',
        body: {
          ...event.data,
          isPublic: state.value.isPublic,
        },
      })

      toast.add({
        title: 'Success',
        description: 'Collection updated successfully',
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
