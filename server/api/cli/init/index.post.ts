import { serverSupabaseClient } from '#supabase/server'
import { WorkspaceService } from '~~/server/services/workspace.service'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const token = event.node.req.headers['authorization']?.replace('Bearer ', '')
  const { mainWorkspaceSlug, additionalWorkspaceSlugs } = await readBody(event)
  const supabase = await serverSupabaseClient<Database>(event)
  const workspaceService = new WorkspaceService(supabase)

  if (!token) {
    return {
      error: true,
      statusCode: 401,
      statusMessage: 'Missing authorization token',
    }
  }

  const { data, error } = await supabase.auth.getUser(token)

  if (!data?.user || error) {
    return {
      error: true,
      statusCode: 401,
      statusMessage: 'Unauthorized',
    }
  }

  const { data: mainWorkspace, error: mainWorkspaceError } =
    await workspaceService.getWorkspaceBySlug(mainWorkspaceSlug as string)

  if (!mainWorkspace || mainWorkspaceError) {
    return {
      error: true,
      statusCode: 400,
      statusMessage: mainWorkspaceError?.message,
    }
  }

  let additionalWorkspaces = []

  if (additionalWorkspaceSlugs || additionalWorkspaceSlugs.length) {
    additionalWorkspaces = await Promise.all(
      additionalWorkspaceSlugs.map(async (slug: string) => {
        const { data: workspace, error } =
          await workspaceService.getWorkspaceBySlug(slug)

        if (!workspace || error) {
          return null
        }

        const { hasAccess } = await workspaceService.checkMember(
          workspace.id,
          data.user.id,
        )

        if (!hasAccess) {
          return null
        }

        return workspace
      }),
    )
  }

  additionalWorkspaces = additionalWorkspaces.filter(Boolean)

  return {
    mainWorkspace,
    additionalWorkspaces,
  }
})
