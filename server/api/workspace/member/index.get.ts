import { WorkspaceService } from '~~/server/services/workspace.service'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  const { workspaceId } = getQuery(event)
  const workspaceService = new WorkspaceService()

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const members = await workspaceService.getMembers(workspaceId as string)

  if (!members) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get members',
    })
  }

  return members
})
