<template>
  <UDashboardGroup>
    <SSidebar />

    <UDashboardPanel>
      <template #header>
        <SNavbar />
        <SEditorToolbar :versions="versions" :language="language" />
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
    language: string
  }>()
</script>
