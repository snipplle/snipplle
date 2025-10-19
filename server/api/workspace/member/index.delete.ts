import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { WorkspaceService } from '~~/server/services/workspace.service'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { userId, workspaceId } = await readBody(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)
  const workspaceService = new WorkspaceService(supabase)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  if (user.id === userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You cannot remove yourself from the workspace',
    })
  }

  const { error } = await workspaceService.removeMember(workspaceId, userId)

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    })
  }

  return {
    success: true,
  }
})
