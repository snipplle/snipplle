import { CollectionService } from '~~/server/services/collection.service'

export default defineEventHandler(async (event) => {
  const { id: slug } = await getRouterParams(event)
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

  const collection = await collectionService.getCollection({
    workspaceId,
    slug,
  })

  if (!collection) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Collection not found',
    })
  }

  const collectionSnippets = await collectionService.getCollectionSnippets(
    collection.id,
    workspaceId as string,
  )

  return {
    ...collection,
    snippets: collectionSnippets,
  }
})
