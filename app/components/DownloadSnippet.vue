<template>
  <ClientOnly>
    <div class="p-2 space-y-6">
      <div class="flex flex-col space-y-2">
        <p class="text-xs font-semibold">Snippet URL (CLI)</p>

        <div class="bg-neutral-700 w-full p-1 rounded-lg">
          <div
            class="bg-neutral-800 w-full p-1.5 flex items-center justify-between rounded-md"
          >
            <p class="text-sm">test/snippet-name@latest</p>

            <UButton
              icon="i-hugeicons-copy-01"
              color="neutral"
              variant="link"
              size="sm"
              @click="copySnippetURL('latest')"
            />
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <p class="text-xs font-semibold">Available versions</p>

        <div
          v-for="i in 3"
          :key="i"
          class="bg-neutral-700 w-full p-1 rounded-lg"
        >
          <div
            class="bg-neutral-800 w-full px-2 flex items-center justify-between rounded-md"
          >
            <p class="text-xs">test/snippet-name@{{ i }}</p>

            <UButton
              icon="i-hugeicons-copy-01"
              color="neutral"
              variant="link"
              size="sm"
              @click="copySnippetURL(i)"
            />
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  const { copy } = useClipboard()
  const toast = useToast()

  function copySnippetURL(version: string | number): void {
    copy(`test/snippet-name@${version}`)

    toast.add({
      title: 'Success',
      description: 'Snippet URL copied to clipboard',
      color: 'success',
      icon: 'i-hugeicons-checkmark-circle-01',
      duration: 1500,
    })
  }
</script>
