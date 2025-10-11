import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../types/database.types'
import type {
  StorageData,
  StorageResponse,
  UploadData,
} from '../types/api.types'

export class StorageService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getSignedUrls(
    paths: string[],
  ): Promise<StorageResponse<StorageData[]>> {
    const { data, error } = await this.supabase.storage
      .from('snippets')
      .createSignedUrls(paths, 60)

    return {
      data,
      error,
    }
  }

  async getSignedUrl(path: string): Promise<StorageResponse<StorageData>> {
    const { data, error } = await this.supabase.storage
      .from('snippets')
      .createSignedUrl(path, 60)

    return {
      data,
      error,
    }
  }

  async download(scope: string, path: string): Promise<StorageResponse<Blob>> {
    const { data, error } = await this.supabase.storage
      .from(scope)
      .download(path)

    return {
      data,
      error,
    }
  }

  async upload(
    scope: string,
    path: string,
    file: Blob,
    options?: any,
  ): Promise<StorageResponse<UploadData>> {
    const { data, error } = await this.supabase.storage
      .from(scope)
      .upload(path, file, options)

    return {
      data,
      error,
    }
  }

  async remove(scope: string, paths: string[]): Promise<StorageResponse<any>> {
    const { data, error } = await this.supabase.storage
      .from(scope)
      .remove(paths)

    return {
      data,
      error,
    }
  }
}
