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
