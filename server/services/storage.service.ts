import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../types/database.types'
import type { StorageResponse } from '../types/api.types'

export class StorageService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getSignedUrls(paths: string[]): Promise<StorageResponse> {
    const { data, error } = await this.supabase.storage
      .from('snippets')
      .createSignedUrls(paths, 60)

    if (error) {
      return {
        data: null,
        error,
      }
    }

    return {
      data,
      error,
    }
  }

  async getSignedUrl(path: string): Promise<StorageResponse> {
    const { data, error } = await this.supabase.storage
      .from('snippets')
      .createSignedUrl(path, 60)

    if (error) {
      return {
        data: null,
        error,
      }
    }

    return {
      data,
      error,
    }
  }
}
