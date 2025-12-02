import { WorkspaceService } from '~~/server/services/workspace.service'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  })

  const workspaceService = new WorkspaceService()

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const workspace = await workspaceService.getDefaultWorkspace(session.user.id)

  if (!workspace) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to get default workspace',
    })
  }

  return workspace
})
