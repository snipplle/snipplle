<template>
  <UDashboardGroup>
    <SidebarBase />

    <UDashboardPanel>
      <template #header>
        <NavbarBase />
        <ToolbarBase />
      </template>

      <template #body>
        <slot />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
