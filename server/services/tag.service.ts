import type { SupabaseClient } from '@supabase/supabase-js'
import { createId } from '@paralleldrive/cuid2'

import type { Database, Tables } from '../types/database.types'
import type { ServiceResponse } from '../types/api.types'

export class TagService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getTag(
    name: string,
    select = '*',
  ): Promise<ServiceResponse<Partial<Tables<'tags'>> | null>> {
    const { data, error } = await this.supabase
      .from('tags')
      .select(select)
      .eq('name', name)
      .single()

    if (error) {
      return {
        data: null,
        error,
      }
    }

    return {
      data: data as Partial<Tables<'tags'>>,
      error,
    }
  }

  async createTag(tag: any): Promise<ServiceResponse<Tables<'tags'> | null>> {
    const { data, error } = await this.supabase
      .from('tags')
      .insert({
        id: createId(),
        name: tag.name,
        color: tag.color,
      })
      .select()
      .single()

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
