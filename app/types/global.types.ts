export interface ActiveWorkspace {
  id: string
  slug: string
}

export interface UseLogout {
  logout: () => Promise<void>
}

export interface UsePermission {
  hasAccess: boolean
}

export interface UseCodeFormat {
  beautifyCode: (code: string) => string
  minifyCode: (code: string) => string
}

export interface UseToolbarEvent {
  call: (event: ToolbarEvent) => void
  listen: (event: ToolbarEvent, callback: (...args: any[]) => void) => void
}
