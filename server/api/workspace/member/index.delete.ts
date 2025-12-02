import { UsageService } from '~~/server/services/usage.service'
import { WorkspaceService } from '~~/server/services/workspace.service'
import { UsageKeys } from '~~/server/types/api.types'

import { removeMemberSchema } from '~~/server/utils/validationSchema'

export default defineEventHandler(async (event) => {
  const { userId, workspaceId } = await readValidatedBody(
    event,
    removeMemberSchema.parse,
  )
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  const workspaceService = new WorkspaceService()
  const usageService = new UsageService()

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  if (session.user.id === userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You cannot remove yourself from the workspace',
    })
  }

  const member = await workspaceService.removeMember(workspaceId, userId)

  if (!member) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to remove member',
    })
  }

  await usageService.decrementUsage(session.user.id, UsageKeys.teamMembers)

  return {
    success: true,
  }
})
