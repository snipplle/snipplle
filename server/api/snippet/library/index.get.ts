import { SnippetService } from '~~/server/services/snippet.service'

export default defineEventHandler(async (event) => {
  const { orderBy, lang, tag, search, page, itemsPerPage } = getQuery(event)
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

  const { data, count } = await snippetService.getSnippets({
    orderBy,
    lang,
    tag,
    search,
    page,
    itemsPerPage,
    onlyPublic: true,
  })

  if (!data) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get snippets',
    })
  }

  return {
    snippets: data,
    count,
  }
})
