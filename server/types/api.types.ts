import type { PostgrestError } from '@supabase/supabase-js'

export interface DatabaseResponse<T> {
  data: T
  count?: number | null
  error: PostgrestError | null
}

export interface SnippetFile {
  snippet_file: string | undefined
}

export interface StorageData {
  signedUrl: string
  path?: string | null
  error?: string | null
}

export interface UploadData {
  id: string
  path: string
  fullPath: string
}

interface StorageError {
  message: string
}

export interface StorageResponse<T> {
  data: T | null
  error: StorageError | null
}

export interface UsageKeys {
  public_snippets: number
  private_snippets: number
  public_collections: number
  private_collections: number
  team_members: number
  ai_requests: number
  ai_tokens: number
}
