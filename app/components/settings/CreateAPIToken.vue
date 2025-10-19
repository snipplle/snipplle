<template>
  <ClientOnly>
    <UModal
      v-model:open="isOpen"
      :ui="{
        content: 'divide-y-0',
        body: 'sm:pt-0 pb-6',
      }"
    >
      <UButton variant="subtle" size="sm">Create Token</UButton>

      <template #header>
        <div class="flex items-center text-white space-x-2">
          <UIcon name="i-hugeicons-key-01" class="text-3xl" />

          <div>
            <h1 class="font-semibold">Create API Token</h1>
            <p class="text-sm text-neutral-400">
              Create a new API token for your workspace
            </p>
          </div>
        </div>
      </template>

      <template #body>
        <UForm
          :state="state"
          :schema="schema"
          class="space-y-4"
          @submit="createToken"
        >
          <UFormField label="Name" name="name" required>
            <UInput
              v-model="state.name"
              variant="subtle"
              class="w-full"
              placeholder="Enter token name"
            />
          </UFormField>

          <div class="flex justify-end">
            <UButton type="submit" size="sm">Create Token</UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </ClientOnly>
</template>

<script setup lang="ts">
  import { z } from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'

  const emits = defineEmits(['onTokenCreated'])

  const toast = useToast()
  const globalStore = useGlobalStore()

  const isOpen = ref(false)
  const state = ref({
    name: undefined,
  })

  const schema = z.object({
    name: z.string('Token name is required'),
  })

  type Schema = z.output<typeof schema>

  async function createToken(event: FormSubmitEvent<Schema>): Promise<void> {
    try {
      await $fetch('/api/setting/api', {
        method: 'POST',
        body: {
          workspaceId: globalStore.activeWorkspace?.id,
          name: event.data.name,
        },
      })

      toast.add({
        title: 'Success',
        description: 'API token created successfully',
        color: 'success',
        icon: 'i-hugeicons-checkmark-circle-01',
        duration: 1500,
      })

      state.value.name = undefined
      isOpen.value = false

      emits('onTokenCreated')
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
