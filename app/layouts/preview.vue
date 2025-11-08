<template>
  <UDashboardGroup>
    <SSidebar />

    <UDashboardPanel
      :ui="{
        body: 'p-0 sm:p-0',
      }"
    >
      <template #header>
        <SNavbar :title="title" />
        <!-- <SEditorToolbar :versions="versions" /> -->
      </template>

      <template #body>
        <slot></slot>
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>

<script setup lang="ts">
  defineProps<{
    title?: string
  }>()
</script>
