<template>
  <UDashboardGroup>
    <SSidebar />

    <UDashboardPanel>
      <template #header>
        <SNavbar :title="title" />
        <SEditorToolbar :versions="versions" />
      </template>

      <template #body>
        <slot></slot>
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>

<script setup lang="ts">
  defineProps<{
    versions: any[]
    title?: string
  }>()
</script>
