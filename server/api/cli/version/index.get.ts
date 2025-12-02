import { SnippetService } from '~~/server/services/snippet.service'
import { WorkspaceService } from '~~/server/services/workspace.service'

export default defineEventHandler(async (event) => {
  const token = event.node.req.headers['authorization']?.replace('Bearer ', '')
  const { snippet } = getQuery(event)
  const workspaceService = new WorkspaceService()
  const snippetService = new SnippetService()

  if (!token) {
    return {
      error: true,
      statusCode: 401,
      statusMessage: 'Missing authorization token',
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

  const [workspaceSlug, snippetSlug] = (snippet as string).split('/')

  const workspace = await workspaceService.getWorkspaceBySlug(workspaceSlug)

  if (!workspace) {
    return {
      error: true,
      statusCode: 400,
      statusMessage: 'Workspace not found',
    }
  }

  const snippetData = await snippetService.getSnippet({
    workspaceId: workspace.id,
    slug: snippetSlug,
  })

  if (!snippetData) {
    return {
      error: true,
      statusCode: 400,
      statusMessage: 'Snippet not found',
    }
  }

  if (!snippetData.isPublic) {
    const { hasAccess } = await workspaceService.checkMember(
      workspace.id,
      data.key?.userId as string,
    )

    if (!hasAccess) {
      return {
        error: true,
        statusCode: 400,
        statusMessage: 'You do not have access to this snippet',
      }
    }
  }

  const versions = await snippetService.getSnippetVersions(
    workspace.id,
    snippetData.id,
  )

  if (!versions) {
    return {
      error: true,
      statusCode: 400,
      statusMessage: 'Failed to get snippet versions',
    }
  }

  return versions
})
