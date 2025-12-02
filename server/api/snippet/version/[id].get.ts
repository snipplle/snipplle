import { SnippetService } from '~~/server/services/snippet.service'

export default defineEventHandler(async (event) => {
  const { id } = await getRouterParams(event)
  const { snippetId, workspaceId, path } = getQuery(event)
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

  const file = await snippetService.getSnippetVersion(
    workspaceId as string,
    snippetId as string,
    id,
    path as string,
  )

  if (!file) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Snippet version not found',
    })
  }

  return file
})
