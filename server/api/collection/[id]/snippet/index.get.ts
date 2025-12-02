import { CollectionService } from '~~/server/services/collection.service'

export default defineEventHandler(async (event) => {
  const { id } = await getRouterParams(event)
  const { workspaceId } = getQuery(event)
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  const collectionService = new CollectionService()

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const snippets = await collectionService.getCollectionSnippets(
    id,
    workspaceId as string,
  )

  if (!snippets) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to get collection snippets',
    })
  }

  return snippets
})
