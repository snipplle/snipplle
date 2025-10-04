<template>
  <UDashboardGroup>
    <SSidebar />

    <UDashboardPanel>
      <template #header>
        <SNavbar />
        <SToolbar :versions="versions" />
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
