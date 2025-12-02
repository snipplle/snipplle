import { CollectionService } from '~~/server/services/collection.service'

import { updateCollectionSchema } from '~~/server/utils/validationSchema'

export default defineEventHandler(async (event) => {
  const { id } = await getRouterParams(event)
  const { name, description, isPublic } = await readValidatedBody(
    event,
    updateCollectionSchema.parse,
  )
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

  const collection = await collectionService.updateCollection(id, {
    name,
    description,
    is_public: isPublic,
  })

  if (!collection) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to update collection',
    })
  }

  return collection
})
