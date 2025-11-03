<template>
  <ClientOnly>
    <div
      class="relative grid min-h-screen grid-cols-[1fr_1px_auto_1px_1fr] grid-rows-[1fr_1px_auto_1px_1fr] [--pattern-fg:var(--color-gray-950)]/5 dark:[--pattern-fg:var(--color-white)]/10"
    >
      <div class="col-start-3 row-start-3 flex flex-col">
        <div
          class="h-full flex flex-col items-center justify-center gap-4 p-2 z-50"
        >
          <UCard class="relative w-full min-w-md max-w-md rounded-lg">
            <div class="space-y-4">
              <div>
                <h1 class="text-2xl font-semibold">Create a workspace</h1>
                <p class="text-sm text-gray-500">
                  Create a new workspace to start organizing your snippets.
                </p>
              </div>

              <UForm
                :state="state"
                :schema="schema"
                class="space-y-4"
                @submit="createWorkspace"
              >
                <UFormField label="Name" name="name">
                  <UInput v-model="state.name" class="w-full" />
                </UFormField>

                <div class="flex justify-between">
                  <UButton
                    type="button"
                    color="neutral"
                    variant="subtle"
                    icon="i-hugeicons-logout-02"
                    @click="logout"
                  />
                  <UButton type="submit" size="sm">Create workspace</UButton>
                </div>
              </UForm>
            </div>

            <ColorAngleContainer />
          </UCard>
        </div>
      </div>

      <LineContainer />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  import * as z from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'

  const toast = useToast()
  const globalStore = useGlobalStore()
  const { logout } = useLogout()

  const state = ref({
    name: '',
  })

  const schema = z.object({
    name: z
      .string('Workspace name is required')
      .min(1, 'Workspace name must be at least 1 character long'),
  })

  type Schema = z.output<typeof schema>

  async function createWorkspace(
    payload: FormSubmitEvent<Schema>,
  ): Promise<void> {
    try {
      const response: any = await $fetch('/api/workspace', {
        method: 'POST',
        body: {
          name: payload.data.name,
        },
      })

      if (!response) {
        toast.add({
          title: 'Oops',
          description: 'Failed to create workspace',
          color: 'error',
          icon: 'i-hugeicons-fire',
          duration: 1500,
        })

        return
      }

      globalStore.setActiveWorkspace({
        id: response.id,
        slug: response.slug,
      })

      await navigateTo(`/workspace/${response.slug}/snippets`)
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
