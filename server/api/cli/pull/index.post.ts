import { CollectionService } from '~~/server/services/collection.service'
import { SnippetService } from '~~/server/services/snippet.service'
import { WorkspaceService } from '~~/server/services/workspace.service'

export default defineEventHandler(async (event) => {
  const token = event.node.req.headers['authorization']?.replace('Bearer ', '')
  const { snippetPath, collectionPath } = await readBody(event)
  const workspaceService = new WorkspaceService()
  const snippetService = new SnippetService()
  const collectionService = new CollectionService()

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

  if (snippetPath) {
    const [workspaceSlug, snippetPart] = snippetPath.split('/')
    const [snippetSlug, version] = snippetPart.split('@')

    const workspace = await workspaceService.getWorkspaceBySlug(workspaceSlug)

    if (!workspace) {
      return {
        error: true,
        statusCode: 400,
        statusMessage: 'Workspace not found',
      }
    }

    const result = await snippetService.pullSnippet(
      workspace.id,
      snippetSlug,
      version || 'latest',
      data.key?.userId as string,
    )

    if (!result || result instanceof Error) {
      return {
        error: true,
        statusCode: 400,
        statusMessage: (result as Error)?.message || 'Failed to pull snippet',
      }
    }

    return {
      path: result,
    }
  }

  const [workspaceSlug, collectionSlug] = collectionPath.split('/')

  const workspace = await workspaceService.getWorkspaceBySlug(workspaceSlug)

  if (!workspace) {
    return {
      error: true,
      statusCode: 400,
      statusMessage: 'Workspace not found',
    }
  }

  const collection = await collectionService.pullCollection(
    workspace.id,
    collectionSlug,
  )

  if (!collection) {
    return {
      error: true,
      statusCode: 400,
      statusMessage: 'Failed to pull collection',
    }
  }

  return {
    path: collection,
  }
})
