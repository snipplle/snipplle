import { UsageService } from '~~/server/services/usage.service'
import { WorkspaceService } from '~~/server/services/workspace.service'
import { UsageKeys } from '~~/server/types/api.types'

import { leaveWorkspaceSchema } from '~~/server/utils/validationSchema'

export default defineEventHandler(async (event) => {
  const { workspaceId } = await readValidatedBody(
    event,
    leaveWorkspaceSchema.parse,
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

  const owner = await workspaceService.getOwner(workspaceId)

  if (!owner || !owner.userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Workspace not found',
    })
  }

  if (owner.userId === session.user.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'You cannot leave the workspace if you are the owner',
    })
  }

  const member = await workspaceService.removeMember(
    workspaceId,
    session.user.id,
  )

  if (!member) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Member not found',
    })
  }

  await usageService.decrementUsage(owner.userId, UsageKeys.teamMembers)

  return {
    success: true,
  }
})
