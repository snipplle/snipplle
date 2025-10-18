<template>
  <ClientOnly>
    <UDashboardSidebar collapsed>
      <template #header>
        <!-- <Logo v-if="!collapsed" class="h-5 w-auto shrink-0" /> -->
        <UIcon
          name="i-hugeicons-document-code"
          class="size-5 text-primary mx-auto"
        />
      </template>

      <template #default>
        <UNavigationMenu
          :items="items[0]"
          orientation="vertical"
          color="neutral"
          :ui="{
            list: 'space-y-1.5',
          }"
          collapsed
          tooltip
        />

        <UNavigationMenu
          :items="items[1]"
          orientation="vertical"
          color="neutral"
          class="mt-auto"
          :ui="{
            list: 'space-y-1.5',
          }"
          collapsed
          tooltip
        />
      </template>

      <template #footer>
        <UButton
          type="button"
          color="neutral"
          variant="ghost"
          icon="i-hugeicons-logout-02"
          @click="logout"
        />
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

    return [
      [
        {
          label: 'Snippets',
          icon: 'i-hugeicons-document-code',
          to: `/workspace/${activeWorkspace?.slug}/snippets`,
        },
        {
          label: 'Collections',
          icon: 'i-hugeicons-code-folder',
          to: `/workspace/${activeWorkspace?.slug}/collections`,
        },
        {
          label: 'Settings',
          icon: 'i-hugeicons-settings-02',
          to: `/settings/profile`,
        },
      ],
      [
        {
          label: 'Docs',
          icon: 'i-hugeicons-book-02',
          target: '_blank',
        },
        {
          label: 'Github',
          icon: 'i-hugeicons-github',
          target: '_blank',
        },
      ],
    ]
  })
</script>
