import { SnippetService } from '~~/server/services/snippet.service'

export default defineEventHandler(async (event) => {
  const { workspaceId, snippetId } = getQuery(event)
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  const snippetService = new SnippetService()

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  if (!workspaceId || !snippetId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Workspace ID and Snippet ID are required',
    })
  }

  const data = await snippetService.getSnippetVersions(
    workspaceId as string,
    snippetId as string,
  )

  if (!data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Snippet not found',
    })
  }

  return data
})
