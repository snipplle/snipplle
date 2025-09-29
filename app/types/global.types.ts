export interface UseLogout {
  logout: () => Promise<void>
}

export interface UsePermission {
  hasAccess: boolean
}

export interface Events {
  'toolbar.update-version': boolean
  'toolbar.preview': boolean
  'toolbar.edit': boolean
  'toolbar.save': boolean
}

export interface UseEvent {
  callEvent: (event: keyof Events) => void
  subscribeEvent: ComputedRef<string | undefined>
  unsubscribeEvent: () => void
}

export interface ActiveWorkspace {
  id: string
  slug: string
}
