import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '~~/server/types/database.types'

export class WorkspaceService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getWorkspaces(select = '*', userId: string) {
    const { data, error } = await this.supabase
      .from('workspaces')
      .select(select)
      .eq('user_id', userId)

    if (error) {
      return {
        data: [],
        error,
      }
    }

    return {
      data,
      error,
    }
  }
}
