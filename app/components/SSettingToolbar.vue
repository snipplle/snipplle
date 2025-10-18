<template>
  <ClientOnly>
    <UDashboardToolbar>
      <div class="w-full flex items-center justify-between">
        <UNavigationMenu
          highlight
          :items="pages"
          variant="link"
          class="data-[orientation=horizontal]:border-b border-default data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-48"
        />
      </div>
    </UDashboardToolbar>
  </ClientOnly>
</template>

<script setup lang="ts">
  const pages = ref([
    {
      label: 'Profile',
      icon: 'i-hugeicons-user',
      to: '/settings/profile',
    },
    {
      label: 'Workspace',
      icon: 'i-hugeicons-office',
      to: '/settings/workspace',
    },
    {
      label: 'Billing',
      icon: 'i-hugeicons-credit-card',
      to: '/settings/billing',
      disabled: true,
    },
    {
      label: 'API',
      icon: 'i-hugeicons-api',
      to: '/settings/api',
    },
  ])
</script>
