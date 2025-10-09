import type { SupabaseClient } from '@supabase/supabase-js'
import { createId } from '@paralleldrive/cuid2'

import type { Database } from '~~/server/types/database.types'

export class TagService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getTag(name: string) {
    const { data, error } = await this.supabase
      .from('tags')
      .select('*')
      .eq('name', name)
      .single()

    if (error) {
      return error
    }

    return data
  }

  async createTag(tag: any) {
    const { data, error } = await this.supabase
      .from('tags')
      .insert({
        id: createId(),
        name: tag.name,
        color: tag.color,
      })
      .select('id')
      .single()

    if (error) {
      return error
    }

    return data
  }

  async createSnippetTag(snippetId: string, tagId: string) {
    const { data, error } = await this.supabase
      .from('snippet_tags')
      .insert({
        snippet_id: snippetId,
        tag_id: tagId,
      })
      .select('id')
      .single()

    if (error) {
      return error
    }

    return data
  }
}
