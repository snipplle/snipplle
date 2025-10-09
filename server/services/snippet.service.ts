import type { SupabaseClient } from '@supabase/supabase-js'
import { createId } from '@paralleldrive/cuid2'
import slugify from 'slugify'

import { orderByMap } from '~~/server/utils/order'
import type { Database } from '~~/server/types/database.types'

export class SnippetService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getSnippets(payload: any) {
    const from = (Number(payload.page) - 1) * Number(payload.itemsPerPage)
    const to = from + Number(payload.itemsPerPage) - 1

    const query = this.supabase
      .from('snippets')
      .select(
        `
      *,
      snippet_tags!inner(
        tags!inner(name, color)
      )
      ${payload.withUrl === 'true' ? ',snippet_versions(is_latest, path)' : ''}
    `,
        { count: 'exact' },
      )
      .in(
        'workspace_id',
        payload.workspaces.map((workspace: any) => workspace.workspace_id),
      )
      .range(from, to)

    if (payload.orderBy) {
      const order = orderByMap[payload.orderBy as string]

      query.order(order.field, {
        ascending: order.ascending,
      })
    }

    if (payload.lang) {
      query.eq('language', payload.lang as string)
    }

    if (payload.tag) {
      query.eq('snippet_tags.tags.name', payload.tag as string)
    }

    if (payload.search) {
      query.ilike('name', `%${payload.search}%`)
    }

    const { data, count, error } = await query

    if (error) {
      return {
        data: [],
        count: 0,
        error,
      }
    }

    return {
      data,
      count,
      error,
    }
  }

  async createSnippet(snippet: any, user: any, workspaceId: string) {
    const { data, error } = await this.supabase
      .from('snippets')
      .insert({
        id: createId(),
        name,
        slug: slugify(name, {
          lower: true,
          remove: /[*+~.()'"!:@]/g,
        }),
        language: snippet.language,
        description: snippet.description,
        is_public: snippet.isPublic,
        created_by: user?.id,
        workspace_id: workspaceId,
      })
      .select()
      .single()

    if (error) {
      return error
    }

    return data
  }
}
