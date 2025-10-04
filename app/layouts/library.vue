<template>
  <UDashboardGroup>
    <SSidebar />

    <UDashboardPanel>
      <template #header>
        <SNavbar />
        <SLibraryToolbar />
      </template>

      <template #body>
        <slot />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
