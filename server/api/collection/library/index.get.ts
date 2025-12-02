import { CollectionService } from '~~/server/services/collection.service'

export default defineEventHandler(async (event) => {
  const { orderBy, lang, tag, search, page, itemsPerPage } = getQuery(event)
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

  const { data, count } = await collectionService.getCollections({
    orderBy,
    lang,
    tag,
    search,
    page,
    itemsPerPage,
    onlyPublic: true,
  })

  return {
    collections: data,
    count,
  }
})
