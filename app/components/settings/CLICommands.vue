<template>
  <ClientOnly>
    <UTabs
      :items="commands"
      variant="link"
      :ui="{
        root: 'bg-default ring ring-neutral-700 gap-0 rounded-lg',
        list: 'border-b border-neutral-700',
        content: 'bg-neutral-800 p-4 rounded-b-lg',
      }"
    >
      <template #content="{ item }">
        <div class="flex items-center justify-between">
          <p class="text-sm text-neutral-300">{{ item.content }}</p>

          <UButton
            icon="i-hugeicons-copy-01"
            color="neutral"
            variant="link"
            size="sm"
            @click="copyToClipboard(item.content)"
          />
        </div>
      </template>
    </UTabs>
  </ClientOnly>
</template>

<script setup lang="ts">
  const { copy } = useClipboard()
  const toast = useToast()

  const commands = ref([
    {
      label: 'npm',
      content: 'npm install -g @snipplle/cli',
    },
    {
      label: 'yarn',
      content: 'yarn global add @snipplle/cli',
    },
    {
      label: 'pnpm',
      content: 'pnpm add -g @snipplle/cli',
    },
  ])

  function copyToClipboard(text: string): void {
    copy(text)

    toast.add({
      title: 'Success',
      description: 'Command copied to clipboard',
      color: 'success',
      icon: 'i-hugeicons-checkmark-circle-01',
      duration: 1500,
    })
  }
</script>
