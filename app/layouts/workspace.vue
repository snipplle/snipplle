<template>
  <UDashboardGroup>
    <SidebarBase />

    <UDashboardPanel>
      <template #header>
        <NavbarBase />
      </template>

      <template #body>
        <slot />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
