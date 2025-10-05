<template>
  <ClientOnly>
    <UModal
      v-model:open="isOpen"
      :ui="{
        content: 'divide-y-0',
        body: 'sm:pt-0 pb-6',
      }"
    >
      <UButton :variant="variant">Create {{ pageTitle }}</UButton>

      <template #header>
        <div class="flex items-center text-white space-x-2">
          <UIcon name="i-hugeicons-document-code" class="text-3xl" />

          <div>
            <h1 class="font-semibold">{{ `Create ${pageTitle}` }}</h1>
            <p class="text-sm text-neutral-400">Create a new {{ pageTitle }}</p>
          </div>
        </div>
      </template>

      <template #body>
        <UForm
          :state="state"
          :schema="schema"
          class="space-y-4"
          @submit="createSnippet"
        >
          <div class="flex space-x-2">
            <UFormField
              label="Name"
              name="name"
              description="The name of the snippet."
              class="w-full"
              required
            >
              <UInput v-model="state.name" variant="subtle" class="w-full" />
            </UFormField>

            <UFormField
              label="Language"
              name="language"
              description="The language of the snippet."
              class="w-full"
              required
            >
              <USelect
                v-model="state.language"
                :items="languageOptions"
                variant="subtle"
                class="w-full"
              />
            </UFormField>
          </div>

          <UFormField
            label="Description"
            name="description"
            description="The description of the snippet."
            class="w-full"
          >
            <UTextarea
              v-model="state.description"
              variant="subtle"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Tags"
            name="tags"
            description="The tags of the snippet."
          >
            <UInputTags
              v-model="state.tags"
              variant="subtle"
              class="w-full"
              :duplicate="false"
              @change="tagsFocused = true"
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

          <div class="flex justify-between">
            <UButton color="neutral" variant="subtle" size="sm" @click="close">
              Close
            </UButton>
            <UButton type="submit">Create snippet</UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </ClientOnly>
</template>

<script setup lang="ts">
  import { capitalize } from 'vue'
  import * as z from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'

  withDefaults(
    defineProps<{
      variant?: 'solid' | 'subtle'
    }>(),
    {
      variant: 'solid',
    },
  )

  const route = useRoute()
  const globalStore = useGlobalStore()
  const toast = useToast()

  const isOpen = ref(false)
  const tagsFocused = ref(false)

  const state = ref({
    name: '',
    language: undefined,
    description: '',
    tags: [] as string[],
    isPublic: true,
  })

  const schema = z.object({
    name: z
      .string('Snippet name is required')
      .min(1, 'Snippet name must be at least 1 character long'),
    language: z.string('Snippet language is required'),
    description: z.string().optional(),
    tags: z.array(z.string().optional()),
    isPublic: z.boolean(),
  })

  type Schema = z.output<typeof schema>

  const pageTitle = computed(() => {
    return capitalize(route.fullPath.split('/')[3] as string)
  })

  async function createSnippet(event: FormSubmitEvent<Schema>): Promise<void> {
    const tagsColored = event.data.tags.map((tag) => ({
      name: tag,
      color: tagColors[Math.floor(Math.random() * tagColors.length)],
    }))

    try {
      const response = await $fetch('/api/snippet', {
        method: 'POST',
        body: {
          name: event.data.name,
          language: event.data.language,
          description: event.data.description,
          tags: tagsColored,
          isPublic: event.data.isPublic,
          workspaceId: globalStore.activeWorkspace?.id,
        },
      })

      await navigateTo(
        `/workspace/${globalStore.activeWorkspace?.slug}/snippet/${response.slug}`,
      )
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
    state.value = {
      name: '',
      language: undefined,
      description: '',
      tags: [],
      isPublic: true,
    }

    isOpen.value = false
  }
</script>
