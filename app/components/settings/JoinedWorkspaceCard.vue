<template>
  <ClientOnly>
    <div
      class="bg-neutral-800 border border-neutral-700 p-2 rounded-md flex items-center justify-between"
    >
      <h1 class="ml-2 font-medium">{{ workspace.workspaces.name }}</h1>

      <UButton variant="link" type="button" size="sm">Leave</UButton>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  defineProps<{
    workspace: any
  }>()
</script>
