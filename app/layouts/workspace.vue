<template>
  <UDashboardGroup>
    <SSidebar />

    <UDashboardPanel>
      <template #header>
        <SNavbar />
      </template>

      <template #body>
        <slot />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
