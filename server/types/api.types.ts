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

interface StorageError {
  message: string
}

export interface StorageResponse {
  data: StorageData | StorageData[] | null
  error: StorageError | null
}
