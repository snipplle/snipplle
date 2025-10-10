import { createId } from '@paralleldrive/cuid2'
import slugify from 'slugify'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Tables } from '../types/database.types'
import type { ServiceResponse } from '../types/api.types'

export class WorkspaceService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getWorkspaces(): Promise<
    ServiceResponse<Tables<'workspaces'>[] | null>
  > {
    const { data, error } = await this.supabase.from('workspaces').select('*')

    return {
      data,
      error,
    }
  }

  async getUserWorkspaces(
    userId: string,
  ): Promise<
    ServiceResponse<Pick<Tables<'workspace_members'>, 'workspace_id'>[] | null>
  > {
    const { data, error } = await this.supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', userId)

    return {
      data,
      error,
    }
  }

  async createWorkspace(
    name: string,
  ): Promise<ServiceResponse<Tables<'workspaces'> | null>> {
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
  ): Promise<ServiceResponse<Tables<'workspace_members'> | null>> {
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
  ): Promise<ServiceResponse<Tables<'workspaces'> | null>> {
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
      .select('*')
      .eq('id', member.workspace_id)
      .single()

    return {
      data,
      error,
    }
  }
}
