<template>
  <ClientOnly>
    <UModal
      v-model:open="isOpen"
      :ui="{
        content: 'divide-y-0',
        body: 'sm:pt-0 pb-6',
      }"
    >
      <UButton :variant="variant" size="sm">Create {{ pageTitle }}</UButton>

      <template #header>
        <div class="flex items-center text-white space-x-2">
          <UIcon name="i-hugeicons-code-folder" class="text-3xl" />

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
          @submit="createCollection"
        >
          <div class="flex space-x-2">
            <UFormField
              label="Name"
              name="name"
              description="The name of the collection."
              class="w-full"
              required
            >
              <UInput v-model="state.name" variant="subtle" class="w-full" />
            </UFormField>

            <UFormField
              label="Language"
              name="language"
              description="The language of the collection."
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
            description="The description of the collection."
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
            description="The tags of the collection."
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
            label="Is collection public?"
            description="If checked, the collection will be visible to all users."
            :ui="{
              root: 'justify-between items-center flex-row-reverse',
              wrapper: 'ms-0',
            }"
            :disabled="!hasAccess"
          />

          <div class="flex justify-between">
            <UButton color="neutral" variant="subtle" size="sm" @click="close">
              Close
            </UButton>
            <UButton type="submit" size="sm">Create collection</UButton>
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
  const { hasAccess } = await usePermission('private_collections')

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
      .string('Collection name is required')
      .min(1, 'Collection name must be at least 1 character long'),
    language: z.string('Collection language is required'),
    description: z.string().optional(),
    tags: z.array(z.string().optional()),
    isPublic: z.boolean(),
  })

  type Schema = z.output<typeof schema>

  const pageTitle = computed(() => {
    return capitalize(route.fullPath.split('/')[3] as string)
  })

  async function createCollection(
    event: FormSubmitEvent<Schema>,
  ): Promise<void> {
    const tagsColored = event.data.tags.map((tag) => ({
      name: tag,
      color: tagColors[Math.floor(Math.random() * tagColors.length)],
    }))

    try {
      const response = await $fetch('/api/collection', {
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
        `/workspace/${globalStore.activeWorkspace?.slug}/collection/${response.slug}`,
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
