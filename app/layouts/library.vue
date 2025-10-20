<template>
  <UDashboardGroup>
    <SSidebar />

    <UDashboardPanel>
      <template #header>
        <SNavbar />
        <SLibraryToolbar />
      </template>

      <template #body>
        <slot></slot>
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
