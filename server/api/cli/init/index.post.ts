import { WorkspaceService } from '~~/server/services/workspace.service'

export default defineEventHandler(async (event) => {
  const token = event.node.req.headers['authorization']?.replace('Bearer ', '')
  const { mainWorkspaceSlug, additionalWorkspaceSlugs } = await readBody(event)
  const workspaceService = new WorkspaceService()

  if (!token) {
    return {
      error: true,
      statusCode: 400,
      statusMessage: 'Missing token',
    }
  }

  const data = await auth.api.verifyApiKey({
    body: {
      key: token,
    },
  })

  if (!data.valid || data.error) {
    return {
      error: true,
      statusCode: 401,
      statusMessage: 'Unauthorized',
    }
  }

  const mainWorkspace = await workspaceService.getWorkspaceBySlug(
    mainWorkspaceSlug as string,
  )

  if (!mainWorkspace) {
    return {
      error: true,
      statusCode: 400,
      statusMessage: 'Main workspace not found',
    }
  }

  let additionalWorkspaces = []

  if (additionalWorkspaceSlugs || additionalWorkspaceSlugs.length) {
    additionalWorkspaces = await Promise.all(
      additionalWorkspaceSlugs.map(async (slug: string) => {
        const workspace = await workspaceService.getWorkspaceBySlug(slug)

        if (!workspace) {
          return null
        }

        const { hasAccess } = await workspaceService.checkMember(
          workspace.id,
          data.key?.userId as string,
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
