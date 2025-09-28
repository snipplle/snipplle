export interface UseLogout {
  logout: () => Promise<void>
}

export interface UsePermission {
  hasAccess: boolean
}

export interface ActiveWorkspace {
  id: string
  slug: string
}
