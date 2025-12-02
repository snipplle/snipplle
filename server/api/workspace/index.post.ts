import { WorkspaceService } from '~~/server/services/workspace.service'

import { createWorkspaceSchema } from '~~/server/utils/validationSchema'

export default defineEventHandler(async (event) => {
  const { name } = await readValidatedBody(event, createWorkspaceSchema.parse)
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

  const workspace = await workspaceService.createWorkspace(name)

  if (!workspace) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to create workspace',
    })
  }

  await workspaceService.addMember(workspace.id, session.user.id, 'owner')

  await auth.api.updateUser({
    body: {
      onboardingCompleted: true,
    },
    headers: event.headers,
  })

  return workspace
})
