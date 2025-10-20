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
      .from('snipplle')
      .createSignedUrls(paths, 60)

    return {
      data,
      error,
    }
  }

  async getSignedUrl(path: string): Promise<StorageResponse<StorageData>> {
    const { data, error } = await this.supabase.storage
      .from('snipplle')
      .createSignedUrl(path, 60)

    return {
      data,
      error,
    }
  }

  async download(path: string): Promise<StorageResponse<Blob>> {
    const { data, error } = await this.supabase.storage
      .from('snipplle')
      .download(path)

    return {
      data,
      error,
    }
  }

  async upload(
    path: string,
    file: Blob,
    options?: any,
  ): Promise<StorageResponse<UploadData>> {
    const { data, error } = await this.supabase.storage
      .from('snipplle')
      .upload(path, file, options)

    return {
      data,
      error,
    }
  }

  async remove(paths: string[]): Promise<StorageResponse<any>> {
    const { data, error } = await this.supabase.storage
      .from('snipplle')
      .remove(paths)

    return {
      data,
      error,
    }
  }
}
