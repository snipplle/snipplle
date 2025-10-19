import { createId } from '@paralleldrive/cuid2'
import slugify from 'slugify'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Tables } from '../types/database.types'
import type { DatabaseResponse } from '../types/api.types'

export class WorkspaceService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getWorkspaces(): Promise<
    DatabaseResponse<Tables<'workspaces'>[] | null>
  > {
    const { data, error } = await this.supabase.from('workspaces').select()

    return {
      data,
      error,
    }
  }

  async getUserWorkspaces(
    userId: string,
    select = 'workspace_id',
  ): Promise<DatabaseResponse<any[] | null>> {
    const { data, error } = await this.supabase
      .from('workspace_members')
      .select(select)
      .eq('user_id', userId)

    return {
      data,
      error,
    }
  }

  async createWorkspace(
    name: string,
  ): Promise<DatabaseResponse<Tables<'workspaces'> | null>> {
    const { data, error } = await this.supabase
      .from('workspaces')
      .insert({
        id: createId(),
        name,
        slug: slugify(name, {
          lower: true,
          remove: /[*+~.()'"!:@]/g,
        }),
      })
      .select()
      .single()

    return {
      data,
      error,
    }
  }

  async addMember(
    workspaceId: string,
    userId: string,
    role: Tables<'workspace_members'>['role'],
  ): Promise<DatabaseResponse<Tables<'workspace_members'> | null>> {
    const { data, error } = await this.supabase
      .from('workspace_members')
      .insert({
        id: createId(),
        workspace_id: workspaceId,
        user_id: userId,
        role,
      })
      .select()
      .single()

    return {
      data,
      error,
    }
  }

  async getDefaultWorkspace(
    userId: string,
  ): Promise<DatabaseResponse<Tables<'workspaces'> | null>> {
    const { data: member, error: memberError } = await this.supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', userId)
      .eq('role', 'owner')
      .single()

    if (!member || memberError) {
      return {
        data: member,
        error: memberError,
      }
    }

    const { data, error } = await this.supabase
      .from('workspaces')
      .select()
      .eq('id', member.workspace_id)
      .single()

    return {
      data,
      error,
    }
  }

  async getWorkspaceBySlug(
    slug: string,
  ): Promise<DatabaseResponse<Tables<'workspaces'> | null>> {
    const { data, error } = await this.supabase
      .from('workspaces')
      .select()
      .eq('slug', slug)
      .single()

    return {
      data,
      error,
    }
  }

  async getMembers(workspaceId: string): Promise<
    DatabaseResponse<
      | (Tables<'workspace_members'> & {
          user?: Tables<'users'> | null
        })[]
      | null
    >
  > {
    const { data, error } = await this.supabase
      .from('workspace_members')
      .select()
      .eq('workspace_id', workspaceId)

    if (!data || error) {
      return {
        data,
        error,
      }
    }

    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select()
      .in(
        'id',
        data.map((item) => item.user_id),
      )

    if (!user || userError) {
      return {
        data,
        error: userError,
      }
    }

    return {
      data: data.map((item) => ({
        ...item,
        user: user.find((userItem) => userItem.id === item.user_id),
      })),
      error,
    }
  }

  async removeMember(
    workspaceId: string,
    userId: string,
  ): Promise<DatabaseResponse<Tables<'workspace_members'> | null>> {
    const { data, error } = await this.supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .select()
      .single()

    return {
      data,
      error,
    }
  }
}
