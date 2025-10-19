import { serverSupabaseClient } from '#supabase/server'
import { WorkspaceService } from '~~/server/services/workspace.service'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const token = event.node.req.headers['authorization']?.replace('Bearer ', '')
  const { mainWorkspaceSlug, additionalWorkspaceSlugs } = await readBody(event)
  const supabase = await serverSupabaseClient<Database>(event)
  const workspaceService = new WorkspaceService(supabase)

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing authorization token',
    })
  }

  const { data, error } = await supabase.auth.getUser(token)

  if (!data?.user || error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { data: mainWorkspace, error: mainWorkspaceError } =
    await workspaceService.getWorkspaceBySlug(mainWorkspaceSlug as string)

  if (!mainWorkspace || mainWorkspaceError) {
    throw createError({
      statusCode: 400,
      statusMessage: mainWorkspaceError?.message,
    })
  }

  let additionalWorkspaces

  if (additionalWorkspaceSlugs || additionalWorkspaceSlugs.length) {
    additionalWorkspaces = await Promise.all(
      additionalWorkspaceSlugs.map(async (slug: string) => {
        const { data, error } = await workspaceService.getWorkspaceBySlug(slug)

        if (!data || error) {
          return
        }

        return data
      }),
    )
  }

  return {
    mainWorkspace,
    additionalWorkspaces,
  }
})
