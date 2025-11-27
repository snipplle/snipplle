import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { UsageService } from '~~/server/services/usage.service'
import { WorkspaceService } from '~~/server/services/workspace.service'

import type { Database } from '~~/server/types/database.types'
import { leaveWorkspaceSchema } from '~~/server/utils/validationSchema'

export default defineEventHandler(async (event) => {
  const { workspaceId } = await readValidatedBody(
    event,
    leaveWorkspaceSchema.parse,
  )
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)
  const workspaceService = new WorkspaceService(supabase)
  const usageService = new UsageService(supabase)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { data: owner } = await workspaceService.getOwner(workspaceId)

  if (!owner || !owner.user_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Workspace not found',
    })
  }

  if (owner.user_id === user?.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'You cannot leave the workspace if you are the owner',
    })
  }

  const { error } = await workspaceService.removeMember(workspaceId, user?.id)

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    })
  }

  await usageService.decrementUsage(owner.user_id, 'team_members')

  return {
    success: true,
  }
})
