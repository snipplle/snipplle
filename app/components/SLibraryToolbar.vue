<template>
  <ClientOnly>
    <UDashboardToolbar>
      <div class="w-full flex items-center justify-between">
        <div class="space-x-1">
          <UButton
            icon="i-hugeicons-filter"
            color="neutral"
            variant="subtle"
            size="sm"
          >
            Filter
          </UButton>
          <UButton
            icon="i-hugeicons-unfold-more"
            color="neutral"
            variant="subtle"
            size="sm"
          >
            Order by
          </UButton>
        </div>

        <UInput
          icon="i-hugeicons-search-01"
          variant="subtle"
          size="sm"
          placeholder="Search..."
        />
      </div>
    </UDashboardToolbar>
  </ClientOnly>
</template>
