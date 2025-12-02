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
          v-if="!apiKey"
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

        <div v-else class="space-y-4">
          <UFormField
            label="API Key"
            help="This is your API token. He is only shown once. Keep it secret!"
          >
            <UInput v-model="apiKey" variant="subtle" class="w-full" readonly>
              <template #trailing>
                <UButton
                  variant="link"
                  color="neutral"
                  size="xs"
                  icon="i-hugeicons-copy-01"
                  @click="copyToken"
                />
              </template>
            </UInput>
          </UFormField>

          <div class="flex justify-end">
            <UButton variant="subtle" color="neutral" size="sm" @click="close">
              Close
            </UButton>
          </div>
        </div>
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
  const { copy } = useClipboard()

  const isOpen = ref(false)
  const state = ref({
    name: undefined,
  })
  const apiKey = ref()

  const schema = z.object({
    name: z.string('Token name is required'),
  })

  type Schema = z.output<typeof schema>

  async function createToken(event: FormSubmitEvent<Schema>): Promise<void> {
    try {
      const response = await $fetch('/api/setting/api', {
        method: 'POST',
        body: {
          workspaceId: globalStore.activeWorkspace?.id,
          name: event.data.name,
        },
      })

      apiKey.value = response

      toast.add({
        title: 'Success',
        description: 'API key created successfully',
        color: 'success',
        icon: 'i-hugeicons-checkmark-circle-01',
        duration: 1500,
      })

      state.value.name = undefined

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

  async function copyToken(): Promise<void> {
    try {
      await copy(apiKey.value)

      toast.add({
        title: 'Success',
        description: 'API key copied to clipboard',
        color: 'success',
        icon: 'i-hugeicons-checkmark-circle-01',
        duration: 1500,
      })
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

  function close(): void {
    isOpen.value = false
    apiKey.value = undefined
  }
</script>
