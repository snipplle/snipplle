<template>
  <UDashboardGroup>
    <SidebarBase />

    <UDashboardPanel>
      <template #header>
        <NavbarBase />
        <ToolbarBase :versions="versions" />
      </template>

      <template #body>
        <slot />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>

<script setup lang="ts">
  defineProps<{
    versions: any[]
  }>()
</script>
