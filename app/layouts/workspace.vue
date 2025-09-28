<template>
  <UDashboardGroup>
    <SidebarBase />

    <UDashboardPanel>
      <template #header>
        <NavbarBase />
        <ToolbarBase :show-toolbar="showToolbar" />
      </template>

      <template #body>
        <slot />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>

<script setup lang="ts">
  defineProps<{
    showToolbar?: boolean
  }>()
</script>
