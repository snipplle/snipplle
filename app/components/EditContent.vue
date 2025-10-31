<template>
  <ClientOnly>
    <div class="p-1">
      <div class="p-4 space-y-5">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-sm">ID:</p>
            <p class="text-neutral-400 font-medium text-xs">
              {{ data.id }}
            </p>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-sm">Language:</p>
            <UBadge
              :color="language[data.language].color"
              variant="subtle"
              size="sm"
            >
              {{ language[data.language].label }}
            </UBadge>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-sm">Downloads:</p>

            <div class="flex items-center space-x-1 text-neutral-400 text-xs">
              <p class="font-medium">{{ data.downloads }}</p>
              <UIcon name="i-hugeicons-download-01" />
            </div>
          </div>
          <div class="flex flex-col">
            <p class="text-sm">Description:</p>
            <p class="text-neutral-400 font-medium text-xs">
              {{ data.description }}
            </p>
          </div>
        </div>

        <USeparator orientation="horizontal" />

        <UForm
          :state="state"
          :schema="schema"
          class="space-y-4"
          @submit="updateCallback"
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
            :label="`Is ${scope} public?`"
            :description="`If checked, the ${scope} will be visible to all users.`"
            :ui="{
              root: 'justify-between items-center flex-row-reverse',
              wrapper: 'ms-0',
            }"
          />

          <div class="flex justify-end">
            <UButton type="submit">Update {{ capitalize(scope) }}</UButton>
          </div>
        </UForm>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  import { capitalize } from 'vue'

  const props = defineProps<{
    scope: string
    data: any
    state: any
    schema: any
    updateCallback: (event: any) => Promise<void>
  }>()

  const state = ref(props.state)
</script>
