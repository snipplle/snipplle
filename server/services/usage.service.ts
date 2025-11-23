import { PostgrestError, type SupabaseClient } from '@supabase/supabase-js'

import type { Database, Tables } from '../types/database.types'
import type { DatabaseResponse, UsageKeys } from '../types/api.types'

export class UsageService {
  isSelfHostedInstance: boolean

  constructor(private supabase: SupabaseClient<Database>) {
    const config = useRuntimeConfig()

    this.isSelfHostedInstance = config.SELF_HOSTED === 'true' ? true : false
  }

  async verifyUsage(userId: string, usageKey: string): Promise<any> {
    if (this.isSelfHostedInstance) {
      return {
        data: false,
        error: null,
      }
    }

    const { data, error } = await this.supabase.functions.invoke(
      'verify-usage',
      {
        body: {
          userId,
          usageKey,
        },
      },
    )

    if (error) {
      return {
        data: null,
        error,
      }
    }

    return {
      data: JSON.parse(data).isExceeded,
      error,
    }
  }

  async incrementUsage(
    userId: string,
    usageKey: string,
  ): Promise<DatabaseResponse<Tables<'usages'> | null>> {
    if (this.isSelfHostedInstance) {
      return {
        data: null,
        error: null,
      }
    }

    const { data: usage } = await this.supabase
      .from('usages')
      .select(
        `
        snippets,
        snippet_versions,
        collections,
        team_members,
        ai_requests,
        ai_tokens
        `,
      )
      .eq('user_id', userId)
      .single()

    if (!usage) {
      return {
        data: null,
        error: new PostgrestError({
          message: 'Usage not found',
          details: 'No usage record found for the given user ID',
          hint: 'Check if the user ID is correct',
          code: 'PGRST123',
        }),
      }
    }

    const payload = {
      [usageKey]: Number(usage[usageKey as keyof UsageKeys]) + 1,
    }

    const { data, error } = await this.supabase
      .from('usages')
      .update({
        user_id: userId,
        ...payload,
      })
      .eq('user_id', userId)
      .select()
      .single()

    return {
      data,
      error,
    }
  }

  async decrementUsage(userId: string, usageKey: string): Promise<any> {
    if (this.isSelfHostedInstance) {
      return {
        data: null,
        error: null,
      }
    }

    const { data: usage } = await this.supabase
      .from('usages')
      .select(
        `
        snippets,
        snippet_versions,
        collections,
        team_members,
        ai_requests,
        ai_tokens
        `,
      )
      .eq('user_id', userId)
      .single()

    if (!usage) {
      return {
        data: null,
        error: new PostgrestError({
          message: 'Usage not found',
          details: 'No usage record found for the given user ID',
          hint: 'Check if the user ID is correct',
          code: 'PGRST123',
        }),
      }
    }

    const payload = {
      [usageKey]: Number(usage[usageKey as keyof UsageKeys]) - 1,
    }

    const { data, error } = await this.supabase
      .from('usages')
      .update({
        user_id: userId,
        ...payload,
      })
      .eq('user_id', userId)
      .select()
      .single()

    return {
      data,
      error,
    }
  }
}
