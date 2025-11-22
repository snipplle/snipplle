import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { UsageService } from '~~/server/services/usage.service'
import { WorkspaceService } from '~~/server/services/workspace.service'

import type { Database } from '~~/server/types/database.types'
import { removeMemberSchema } from '~~/server/utils/validationSchema'

export default defineEventHandler(async (event) => {
  const { userId, workspaceId } = await readValidatedBody(
    event,
    removeMemberSchema.parse,
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

  await usageService.decrementUsage(user?.id, 'team_members')

  return {
    success: true,
  }
})
