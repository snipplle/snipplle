import { SnippetService } from '~~/server/services/snippet.service'

export default defineEventHandler(async (event) => {
  const { id: slug } = await getRouterParams(event)
  const { workspaceId } = getQuery(event)
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

  const snippet = await snippetService.getSnippet({
    slug,
    workspaceId,
    withUrl: true,
  })

  if (!snippet) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to get snippet',
    })
  }

  return snippet
})
