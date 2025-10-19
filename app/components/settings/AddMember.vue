<template>
  <ClientOnly>
    <UModal
      v-model:open="isOpen"
      :ui="{
        content: 'divide-y-0',
        body: 'sm:pt-0 pb-6',
      }"
    >
      <UButton
        color="neutral"
        variant="link"
        type="button"
        size="sm"
        icon="i-heroicons-plus"
      >
        Add member
      </UButton>

      <template #header>
        <div class="flex items-center text-white space-x-2">
          <UIcon name="i-hugeicons-user-add-01" class="text-3xl" />

          <div>
            <h1 class="font-semibold">Add member</h1>
            <p class="text-sm text-neutral-400">
              Add a new member to your workspace
            </p>
          </div>
        </div>
      </template>

      <template #body>
        <UForm
          :state="state"
          :schema="schema"
          class="space-y-4"
          @submit="addMember"
        >
          <UFormField label="Email" name="email" required>
            <UInput
              v-model="state.email"
              variant="subtle"
              class="w-full"
              type="email"
              placeholder="Enter member email"
            />
          </UFormField>

          <div class="flex justify-end">
            <UButton type="submit" size="sm">Add member</UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </ClientOnly>
</template>

<script setup lang="ts">
  import { z } from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'

  const props = defineProps<{
    workspaceId: string | undefined
  }>()

  const toast = useToast()

  const isOpen = ref(false)
  const state = ref({
    email: '',
  })

  const schema = z.object({
    email: z.email('Invalid email address'),
  })

  type Schema = z.output<typeof schema>

  async function addMember(event: FormSubmitEvent<Schema>): Promise<void> {
    try {
      await $fetch('/api/workspace/member', {
        method: 'POST',
        body: {
          workspaceId: props.workspaceId,
          email: event.data.email,
        },
      })

      toast.add({
        title: 'Success',
        description: 'Member added successfully',
        color: 'success',
        icon: 'i-heroicons-check-circle',
        duration: 1500,
      })

      state.value.email = ''
      isOpen.value = false
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
