<template>
  <ClientOnly>
    <UDashboardSidebar collapsible>
      <template #header="{ collapsed }">
        <!-- <Logo v-if="!collapsed" class="h-5 w-auto shrink-0" /> -->
        <UIcon v-if="!collapsed" name="i-hugeicons-document-code" class="size-5 text-primary mx-auto" />
        <UIcon v-else name="i-hugeicons-document-code" class="size-5 text-primary mx-auto" />
      </template>
      
      <template #default="{ collapsed }">
        <UNavigationMenu
          :items="items"
          :collapsed="collapsed"
          orientation="vertical"
          color="neutral"
        />
      </template>

      <template #footer>
        <div class="w-full flex justify-between">
          <UDashboardSidebarCollapse />
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            icon="i-hugeicons-logout-02"
            @click="logout"
          />
        </div>
      </template>
    </UDashboardSidebar>
  </ClientOnly>
</template>

<script setup lang="ts">
  import type { NavigationMenuItem } from '@nuxt/ui'

  const globalStore = useGlobalStore()
  const { logout } = useLogout()

  const items = computed<NavigationMenuItem[][]>(() => {
    const activeWorkspace = globalStore.activeWorkspace

    return [[{
      label: 'Snippets',
      icon: 'i-hugeicons-document-code',
      to: `/workspace/${activeWorkspace}/snippets`
    }]]
  })
</script>