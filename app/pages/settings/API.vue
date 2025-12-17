<template>
  <ClientOnly>
    <NuxtLayout name="setting" title="API">
      <div class="w-full sm:min-w-xl max-w-xl mx-auto space-y-10">
        <div class="space-y-6">
          <div class="flex justify-between items-center">
            <div class="w-4/5">
              <h1 class="font-semibold">API Keys</h1>
              <p class="text-sm text-neutral-400">
                Manage your API keys, such as creating, revoking, and
                regenerating keys.
              </p>
            </div>

            <CreateAPIToken @on-token-created="refresh" />
          </div>

          <APITokenTable :data="data || []" />
        </div>

        <USeparator />

        <div class="space-y-6">
          <div>
            <h1 class="font-semibold">CLI Documentation</h1>
            <p class="text-sm text-neutral-400">
              View the documentation for using the Snipplle CLI.
            </p>
          </div>

          <CLICommands />

          <UButton
            href="https://docs.snipplle.com/cli/installation"
            target="_blank"
            color="neutral"
            variant="subtle"
            size="sm"
          >
            View documentation
          </UButton>
        </div>
      </div>
    </NuxtLayout>
  </ClientOnly>
</template>

<script setup lang="ts">
  const { data, refresh } = await useFetch('/api/setting/api', {
    method: 'GET',
  })
</script>
