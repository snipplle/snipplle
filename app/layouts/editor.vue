<template>
  <UDashboardGroup>
    <SSidebar />

    <UDashboardPanel>
      <template #header>
        <SNavbar :title="title" />
        <SEditorToolbar :versions="versions" :has-access="hasAccess" />
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
    hasAccess?: boolean
  }>()
</script>
